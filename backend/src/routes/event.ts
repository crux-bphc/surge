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
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { codeforcesQueue } from "../queues/codeforcesQueue";
import { addWithRetry } from "../utils/queueHelpers";
import { requireCruxMember } from "../middlewares/auth";
import { getContestMetadata } from "../utils/eventHelpers";

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
    const contests = await db.select().from(eventContests).where(eq(eventContests.eventId, id)).orderBy(desc(eventContests.startTime));;
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
        .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.userId, userId)))
        .limit(1);

      if (!membership || !membership.groupId) {
        res.status(404).json({ message: "no group found" });
        return;
      }

      const results = await db
        .select({
          userId: users.id,
          name: users.name,
          email: users.email,
          cfHandle: users.cfHandle,
          cfRating: users.cfRating,
          pfpUrl: users.pfpUrl,
          groupName: eventGroups.name,
          score: eventParticipants.participantScore,
        })
        .from(eventParticipants)
        .innerJoin(users, eq(eventParticipants.userId, users.id))
        .innerJoin(eventGroups, eq(eventParticipants.groupId, eventGroups.id))
        .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.groupId, membership.groupId)))
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
      const contestLookup = await db.select({eventId: eventContests.eventId}).from(eventContests).where(eq(eventContests.id, contestId)).limit(1);
      
      const parentEventId = contestLookup[0]?.eventId;
      if (!parentEventId) {
        res.status(404).json({ message: "contest not found" });
        return;
      }

      const results = await db
        .select({
          groupId: eventGroups.id,
          groupName: eventGroups.name,
          score: sql`cast(coalesce(sum(${eventContestsScore.contestScore}), 0) as int)`.mapWith(Number),
        })
        .from(eventGroups)
        // shows you if you aren't in a group
        .leftJoin(eventParticipants, eq(eventGroups.id, eventParticipants.groupId))
        // shows you if you didnt solve anyth also 
        .leftJoin(eventContestsScore,
          and(
            eq(eventParticipants.id, eventContestsScore.participantId),
            eq(eventContestsScore.contestId, contestId)
          ))
        .where(eq(eventGroups.eventId, parentEventId))
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
        .select({participantId: eventParticipants.id, groupId: eventParticipants.groupId, })
        .from(eventParticipants)
        .where(and(eq(eventParticipants.eventId, contest.eventId), eq(eventParticipants.userId, userId)))
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
          email: users.email,
          cfHandle: users.cfHandle,
          cfRating: users.cfRating,
          pfpUrl: users.pfpUrl,
          score: eventContestsScore.contestScore,
        })
        .from(eventParticipants)
        .innerJoin(users, eq(eventParticipants.userId, users.id))
        .leftJoin(eventContestsScore, and(
            eq(eventParticipants.id, eventContestsScore.participantId),
            eq(eventContestsScore.contestId, contestId)
          ))
        .where(and(eq(eventContestsScore.contestId, contestId), eq(eventParticipants.groupId, membership.groupId)))
        .orderBy(desc(sql`coalesce(${eventContestsScore.contestScore}, 0)`));

      res.status(200).json(results);
      return;
    }

    // global for a specific contest
    const [contestInfo] = await db.select().from(eventContests).where(eq(eventContests.id, contestId)).limit(1);
    if (!contestInfo) {
      res.status(404).json({ message: "contest not found" });
      return;
    }

    const results = await db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        cfHandle: users.cfHandle,
        cfRating: users.cfRating,
        pfpUrl: users.pfpUrl,
        groupName: eventGroups.name,
        score: eventContestsScore.contestScore,
      })
      .from(eventParticipants)
      .innerJoin(users, eq(eventParticipants.userId, users.id))
      // if usre isnt in a group it still sohws them. 
      // this is useless unless we show groups in the global leaderboard 
      // so if we arent doing that we can just remove these left joins      
      .leftJoin(eventGroups, eq(eventParticipants.groupId, eventGroups.id))
      .leftJoin(eventContestsScore, and(
          eq(eventParticipants.id, eventContestsScore.participantId),
          eq(eventContestsScore.contestId, contestId)
        ))
      .where(eq(eventParticipants.eventId, contestInfo.eventId))
      .orderBy(desc(sql`coalesce(${eventContestsScore.contestScore}, 0)`));
    res.status(200).json(results);
  } catch (err) {
    console.error(`error: ${err}`);
    res.status(500).json({ message: "server error" });
  }
});

// get all groups and members for an event
router.get("/:id/groups", requireCruxMember, async (req, res) => {
  const eventId = parseInt(req.params.id);
  if (isNaN(eventId)) {
    res.status(400).json({ message: "invalid id" });
    return;
  }

  try {
    const groups = await db
      .select({id: eventGroups.id, name: eventGroups.name,})
      .from(eventGroups)
      .where(eq(eventGroups.eventId, eventId));

    const results = await Promise.all(
      groups.map(async (g) => {
        const members = await db
          .select({ email: users.email, participantId: eventParticipants.id, })
          .from(eventParticipants)
          .innerJoin(users, eq(eventParticipants.userId, users.id))
          .where(eq(eventParticipants.groupId, g.id));

        return {...g, members: members, };
      })
    );

    res.status(200).json(results);
  } catch (err) {
    console.error(`error fetching groups: ${err}`);
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

// add new contest to event
router.post("/contests", requireCruxMember, async (req, res) => {
  const { contestId, eventId } = req.body;
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

    // fetch metadata from cf
    const metadata = await getContestMetadata(contestId);
    const [newContest] = await db.insert(eventContests)
      .values({
        id: metadata.id,
        eventId: eventId,
        name: metadata.name,
        startTime: metadata.startTime,
        durationMinutes: metadata.durationMinutes,
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
    res.status(500).json({ message: "Internal server error while creating contest.", detail: err.message || "unknown error, check logs lol" });
  }
});

// create group and resolve emails to ids
router.post("/groups", requireCruxMember, async (req, res) => {
  const { eventId, name, members } = req.body; //members = array of emails
  if (!eventId || !name || !Array.isArray(members)) {
    res.status(400).json({ message: "invalid input" });
    return;
  }

  try {
    const [group] = await db.insert(eventGroups).values({ eventId, name }).returning();

    // resolve emails to user ids
    const matchedUsers = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(inArray(users.email, members));

    const userIds = matchedUsers.map((u) => u.id);
    const matchedEmails = new Set(matchedUsers.map((u) => u.email));
    const failedEmails = members.filter((e) => !matchedEmails.has(e));

    if (userIds.length > 0) {
      await db.insert(eventParticipants).values(
        userIds.map((uid) => ({groupId: group.id, userId: uid, eventId, }))
      ).onConflictDoNothing();
    }

    res.status(201).json({ 
      message: "group created", 
      failedMembers: failedEmails 
    });
  } catch (err) {
    console.error("error creating group:", err);
    res.status(500).json({ message: "server error" });
  }
});

// update group name and add new members
router.put("/groups/:groupId", requireCruxMember, async (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const { name, members, eventId } = req.body;
  
  if (isNaN(groupId) || !eventId || !name || !Array.isArray(members)) {
    res.status(400).json({ message: "invalid input" });
    return;
  }

  try {
    let failedEmails: string[] = [];
    await db.transaction(async (tx) => {
      // Update group name
      await tx.update(eventGroups).set({ name }).where(eq(eventGroups.id, groupId));

      // resolve emails to ids
      const matchedUsers = await tx
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(inArray(users.email, members));

      const userIds = matchedUsers.map((u) => u.id);
      const matchedEmails = new Set(matchedUsers.map((u) => u.email));
      failedEmails = members.filter((e) => !matchedEmails.has(e));

      // just add new members, dont delete old ones
      if (userIds.length > 0) {
        await tx.insert(eventParticipants).values(
          userIds.map((uid) => ({groupId, userId: uid, eventId, }))
        ).onConflictDoNothing();
      }
    });

    res.status(200).json({ 
      message: "group updated", 
      failedMembers: failedEmails 
    });
  } catch (err) {
    console.error("Critical error updating group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// remove individual participant from event
router.delete("/participants/:participantId", requireCruxMember, async (req, res) => {
  const participantId = parseInt(req.params.participantId);
  if (isNaN(participantId)) {
    res.status(400).json({ message: "invalid id" });
    return;
  }
  try {
    await db.delete(eventParticipants).where(eq(eventParticipants.id, participantId));
    res.status(200).json({ message: "participant removed" });
  } catch (err) {
    console.error(`error: ${err}`);
    res.status(500).json({ message: "server error" });
  }
});

// delete group only (members stay in event but become unassigned)
router.delete("/groups/:groupId", requireCruxMember, async (req, res) => {
  const groupId = parseInt(req.params.groupId);
  if (isNaN(groupId)) {
    res.status(400).json({ message: "Invalid group ID" });
    return;
  }
  try {
    // on deletion the group id will be set to null in the db
    await db.delete(eventGroups).where(eq(eventGroups.id, groupId));
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error(`error: ${err}`);
    res.status(500).json({ message: "Server error" });
  }
});

// delete contest from event
router.delete("/contest/:contestId", requireCruxMember, async (req, res) => {
  const contestId = parseInt(req.params.contestId);
  if (isNaN(contestId)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  try {
    await db.delete(eventContests).where(eq(eventContests.id, contestId));
    res.status(200).json({ message: "Contest deleted" });
  } catch (err) {
    console.error(`error: ${err}`);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
