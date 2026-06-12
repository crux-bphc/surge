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
      .leftJoin(eventGroups, eq(eventParticipants.groupId, eventGroups.id)) // incaes someones not in a group. lucky(?)
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

router.post("/contests", requireCruxMember, async (req, res) => {
  const { contestId, eventId, name } = req.body;

  if (!contestId || !eventId) {
    res.status(400).json({ message: "missing required fields" });
    return;
  }

  try {
    // verify the parent event exists before attaching a contest
    const [associatedEvent] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!associatedEvent) {
      res.status(404).json({ message: "The specified event ID does not exist." });
      return;
    }

    const [newContest] = await db.insert(eventContests)
      .values({
        // Get the duration and startTime from CF API
        eventId: eventId,
        name: name,
        // startTime: 
        // durationMinutes: 
        createdAt: new Date().toISOString(),
      }).returning();

    res.status(201).json({
      message: "Contest deployed successfully!",
      contest: newContest,
    });
  } catch (err: any) {
    console.error(`Error deploying contest: ${err}`);
    if (err.code === "23505") {
       res.status(409).json({ message: "Contest ID already deployed for this event." });
       return;
    }
    res.status(500).json({ message: "Internal server error while creating contest." });
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

      await codeforcesQueue.add(
        "cf-api",
        { type: "event.sync", contestId },
        { removeOnComplete: true }
      );

      res.status(200).json({ message: "sync job is queued" });
    } catch (err) {
      console.error(`error: ${err}`);
      res.status(500).json({ message: "server error" });
    }
  }
);

router.post("/groups", async (req, res) => {
  const { eventId, name, members } = req.body;

  try {
    const [group] = await db.insert(eventGroups).values({ eventId, name }).returning();

    const failedMembers: string[] = [];
    
   // Code should be added here to get the userId from email. 
    for (const email of members) {
      try {
        await db.insert(eventParticipants).values({ 
          groupId: group.id, 
          userId: email, 
          eventId 
        });
      } catch {
        failedMembers.push(email);
      }
    }

    res.status(201).json({ message: "Group created, Following members were not added to the group:", failedMembers });
  } catch (err) {
    console.error("Server error while creating group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/groups/:groupId", async (req, res) => {
  const { groupId } = req.params;
  const { name, members, eventId } = req.body;
  try {
    // Update group name
    await db.update(eventGroups).set({ name }).where(eq(eventGroups.id, Number(groupId)));

    // Dealing with addition or deletion of participants
    const failedMembers: string[] = [];
   // Code should be added here to get the userId from email. 
    for (const email of members) {
      try {
        await db.insert(eventParticipants).values({ groupId: Number(groupId), userId: email, eventId });
      } catch {
        failedMembers.push(email);
      }
    }

    res.json({ message: "Group updated", failedMembers });
  } catch (err) {
    console.error("Critical error updating group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/groups/:groupId", async (req, res) => {
  const groupId = parseInt(req.params.groupId);

  if (isNaN(groupId)) {
    res.status(400).json({ message: "Invalid group ID" });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(eventParticipants)
        .where(eq(eventParticipants.groupId, groupId));

      await tx.delete(eventGroups)
        .where(eq(eventGroups.id, groupId));
    });

    res.status(200).json({ message: "Group and participants deleted successfully" });
  } catch (err) {
    console.error(`error: ${err}`);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;

