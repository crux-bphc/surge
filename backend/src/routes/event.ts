import { Router } from "express";
import { db } from "../drizzle/db";
import {
  events,
  eventContests,
  eventGroups,
  eventParticipants,
  eventContestsScore,
  users,
} from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { codeforcesQueue } from "../queues/codeforcesQueue";
import { addWithRetry } from "../utils/queueHelpers";
import { requireCruxMember } from "../middlewares/auth";

const router = Router();

// list events
router.get("/", async (req, res) => {
  try {
    const allEvents = await db.select().from(events).orderBy(desc(events.createdAt));
    res.status(200).json(allEvents);
  } catch (err) {
    console.error(`error: ${err}`);
    res.status(500).json({ message: "server error" });
  }
});

// event info
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "invalid id" });
    return;
  }
  try {
    const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
    if (!event) {
      res.status(404).json({ message: "not found" });
      return;
    }
    const contests = await db.select().from(eventContests).where(eq(eventContests.eventId, id));
    res.status(200).json({ ...event, contests });
  } catch (err) {
    console.error(`error: ${err}`);
    res.status(500).json({ message: "server error" });
  }
});

// aggregate event leaderboard
router.get("/:id/leaderboard", async (req, res) => {
  const eventId = parseInt(req.params.id);
  if (isNaN(eventId)) {
    res.status(400).json({ message: "invalid id" });
    return;
  }
  const { type } = (req.query as { type?: string }) || {};
  const userId = (req.user as any)?.id;

  try {
    if (type === "group-vs-group") {
      const results = await db
        .select({
          groupId: eventGroups.id,
          groupName: eventGroups.name,
          score: eventGroups.groupScore,
        })
        .from(eventGroups)
        .where(eq(eventGroups.eventId, eventId))
        .orderBy(desc(eventGroups.groupScore));
      res.status(200).json(results);
      return;
    }

    if (type === "intra-group") {
      if (!userId) {
        res.status(401).json({ message: "auth required" });
        return;
      }
      const [membership] = await db
        .select({ groupId: eventParticipants.groupId })
        .from(eventParticipants)
        .where(
          and(
            eq(eventParticipants.eventId, eventId),
            eq(eventParticipants.userId, userId)
          )
        )
        .limit(1);

      if (!membership || !membership.groupId) {
        res.status(404).json({ message: "no group found" });
        return;
      }

      const results = await db
        .select({
          userId: users.id,
          name: users.name,
          cfHandle: users.cfHandle,
          pfpUrl: users.pfpUrl,
          score: eventParticipants.participantScore,
        })
        .from(eventParticipants)
        .innerJoin(users, eq(eventParticipants.userId, users.id))
        .where(
          and(
            eq(eventParticipants.eventId, eventId),
            eq(eventParticipants.groupId, membership.groupId)
          )
        )
        .orderBy(desc(eventParticipants.participantScore));
      res.status(200).json(results);
      return;
    }

    // global
    const results = await db
      .select({
        userId: users.id,
        name: users.name,
        cfHandle: users.cfHandle,
        pfpUrl: users.pfpUrl,
        groupName: eventGroups.name,
        score: eventParticipants.participantScore,
      })
      .from(eventParticipants)
      .innerJoin(users, eq(eventParticipants.userId, users.id))
      .leftJoin(eventGroups, eq(eventParticipants.groupId, eventGroups.id))  // incaes someones not in a group. lucky(?)
      .where(eq(eventParticipants.eventId, eventId))
      .orderBy(desc(eventParticipants.participantScore));
    res.status(200).json(results);
  } catch (err) {
    console.error(`error: ${err}`);
    res.status(500).json({ message: "server error" });
  }
});

// contest info
router.get("/contest/:contestId", async (req, res) => {
  const contestId = parseInt(req.params.contestId);
  if (isNaN(contestId)) {
    res.status(400).json({ message: "invalid id" });
    return;
  }
  try {
    const [info] = await db.select().from(eventContests).where(eq(eventContests.id, contestId)).limit(1);
    if (!info) {
      res.status(404).json({ message: "not found" });
      return;
    }
    res.status(200).json(info);
  } catch (err) {
    console.error(`error: ${err}`);
    res.status(500).json({ message: "server error" });
  }
});

// contest leaderboard
router.get("/contest/:contestId/leaderboard", async (req, res) => {
  const contestId = parseInt(req.params.contestId);
  if (isNaN(contestId)) {
    res.status(400).json({ message: "invalid id" });
    return;
  }
  const { type } = (req.query as { type?: string }) || {};
  const userId = (req.user as any)?.id;

  try {
    // group v group for a contest
    if (type === "group-vs-group") {
      const results = await db
        .select({
          groupId: eventGroups.id,
          groupName: eventGroups.name,
          score: sql<number>`cast(sum(${eventContestsScore.contestScore}) as int)`,
        })
        .from(eventGroups)
        .innerJoin(
          eventParticipants, eq(eventGroups.id, eventParticipants.groupId)
        )
        .innerJoin(
          eventContestsScore, eq(eventParticipants.id, eventContestsScore.participantId)
        )
        .where(eq(eventContestsScore.contestId, contestId))
        .groupBy(eventGroups.id, eventGroups.name)
        .orderBy(desc(sql`sum(${eventContestsScore.contestScore})`));
      res.status(200).json(results);
      return;
    }

    // intra-group for a specific contest
    if (type === "intra-group") {
      if (!userId) {
        res.status(401).json({ message: "auth required" });
        return;
      }
      // get contest info
      const [contest] = await db.select().from(eventContests).where(eq(eventContests.id, contestId)).limit(1);
      if (!contest) {
        res.status(404).json({ message: "contest not found" });
        return;
      }
      // get members group info
      const [membership] = await db
        .select({
          participantId: eventParticipants.id,
          groupId: eventParticipants.groupId,
        })
        .from(eventParticipants)
        .where(
          and(
            eq(eventParticipants.eventId, contest.eventId),
            eq(eventParticipants.userId, userId)
          )
        )
        .limit(1);

      if (!membership || !membership.groupId) {
        res.status(404).json({ message: "no group found" });
        return;
      }
      // leaderboard w joins for said group info
      const results = await db
        .select({
          userId: users.id,
          name: users.name,
          cfHandle: users.cfHandle,
          pfpUrl: users.pfpUrl,
          score: eventContestsScore.contestScore,
        })
        .from(eventParticipants)
        .innerJoin(users, eq(eventParticipants.userId, users.id))
        .innerJoin(eventContestsScore, eq(eventParticipants.id, eventContestsScore.participantId))
        .where(
          and(
            eq(eventContestsScore.contestId, contestId),
            eq(eventParticipants.groupId, membership.groupId)
          )
        )
        .orderBy(desc(eventContestsScore.contestScore));

      res.status(200).json(results);
      return;
    }

    // global for a specific contest
    const results = await db
      .select({
        userId: users.id,
        name: users.name,
        cfHandle: users.cfHandle,
        pfpUrl: users.pfpUrl,
        groupName: eventGroups.name,
        score: eventContestsScore.contestScore,
      })
      .from(eventParticipants)
      .innerJoin(users, eq(eventParticipants.userId, users.id))
      .innerJoin(eventContestsScore, eq(eventParticipants.id, eventContestsScore.participantId))
      // if usre isnt in a group it still sohws them. 
      // this is useless unless we show groups in the global leaderboard 
      // so if we arent doing that we can just remove these left joins      
      .leftJoin(eventGroups, eq(eventParticipants.groupId, eventGroups.id))
      .where(eq(eventContestsScore.contestId, contestId))
      .orderBy(desc(eventContestsScore.contestScore));
    res.status(200).json(results);
  } catch (err) {
    console.error(`error: ${err}`);
    res.status(500).json({ message: "server error" });
  }
});

// sync leaderboard for contest
router.post(
  "/contest/:contestId/sync",
   requireCruxMember,
   async (req, res) => {
  const contestId = parseInt(req.params.contestId);
  if (isNaN(contestId)) {
    res.status(400).json({ message: "invalid id" });
    return;
  }

  try {
    const [contest] = await db.select().from(eventContests).where(eq(eventContests.id, contestId)).limit(1);

    if (!contest) {
      res.status(404).json({ message: "contest not found" });
      return;
    }
    await addWithRetry(codeforcesQueue, "cf-api", { type: "event.sync", contestId });
    res.status(200).json({ message: "sync job is queued" });
  } catch (err) {
    console.error(`error: ${err}`);
    res.status(500).json({ message: "server error" });
  }
}
);

export default router;

