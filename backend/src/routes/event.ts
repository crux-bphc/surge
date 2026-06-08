import { Router } from "express";
import { db } from "../drizzle/db";
import {
  events,
  campusContests,
  campusGroups,
  campusContestGroups,
  campusContestParticipants,
  campusContestSolves,
  problems,
  users,
} from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// dynamic points: a=1, b=2, c=3...
// the coalesce returns 0 instead of null so the 0 scorers are on the leaderboard. great
const points = sql<number>`COALESCE(SUM(
  CASE 
    WHEN UPPER(LEFT(${problems.index}, 1)) = 'A' THEN 1
    WHEN UPPER(LEFT(${problems.index}, 1)) = 'B' THEN 2
    WHEN UPPER(LEFT(${problems.index}, 1)) = 'C' THEN 3
    WHEN UPPER(LEFT(${problems.index}, 1)) = 'D' THEN 4
    WHEN UPPER(LEFT(${problems.index}, 1)) = 'E' THEN 5
    WHEN UPPER(LEFT(${problems.index}, 1)) = 'F' THEN 6
    WHEN UPPER(LEFT(${problems.index}, 1)) = 'G' THEN 7
    WHEN UPPER(LEFT(${problems.index}, 1)) = 'H' THEN 8
    ELSE 0 
  END
), 0)`;

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
    const contests = await db.select().from(campusContests).where(eq(campusContests.eventId, id)); // contest w event id
    res.status(200).json({ ...event, contests }); // event deets w list of contests
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
  const { type } = req.query as { type?: string };
  const userId = (req.user as any)?.id;

  try {
    if (type === "group-vs-group") {
      const results = await db
        .select({
          groupId: campusGroups.id,
          groupName: campusGroups.groupName,
          score: sql<number>`cast(${points} as int)`,
        })
        .from(campusContestGroups)
        .innerJoin(campusGroups, eq(campusContestGroups.groupId, campusGroups.id)) // getting group name
        .innerJoin(campusContests, eq(campusContestGroups.contestId, campusContests.id)) // filter groups by event
        .leftJoin(campusContestSolves, eq(campusContestGroups.id, campusContestSolves.contestGroupId)) // get total scores for the group
        .leftJoin(problems, eq(campusContestSolves.problemId, sql`cast(${problems.id} as text)`)) // prob index for point calc
        .where(eq(campusContests.eventId, eventId))
        .groupBy(campusGroups.id, campusGroups.groupName)
        .orderBy(desc(points));
      res.status(200).json(results);
      return;
    }

    if (type === "intra-group") {
      if (!userId) {
        res.status(401).json({ message: "auth required" });
        return;
      }
      const [membership] = await db
        .select({ groupId: campusContestGroups.groupId })
        .from(campusContestParticipants)
        .innerJoin(campusContestGroups, eq(campusContestParticipants.contestGroupId, campusContestGroups.id)) // link user to group
        .innerJoin(campusContests, eq(campusContestGroups.contestId, campusContests.id)) // to filter by event to see full scores and such
        .where(and(eq(campusContests.eventId, eventId), eq(campusContestParticipants.userId, userId)))
        .limit(1);

      if (!membership) {
        res.status(404).json({ message: "no group found" });
        return;
      }

      const results = await db
        .select({
          userId: users.id,
          name: users.name,
          cfHandle: users.cfHandle,
          pfpUrl: users.pfpUrl,
          score: sql<number>`cast(${points} as int)`,
        })
        .from(campusContestParticipants)
        .innerJoin(users, eq(campusContestParticipants.userId, users.id)) // basic user info (username, av, handle)
        .innerJoin(campusContestGroups, eq(campusContestParticipants.contestGroupId, campusContestGroups.id)) // filter user by user group
        .innerJoin(campusContests, eq(campusContestGroups.contestId, campusContests.id)) // filter by event
        .leftJoin(campusContestSolves, eq(campusContestParticipants.id, campusContestSolves.participantId)) // aggregrate user scores
        .leftJoin(problems, eq(campusContestSolves.problemId, sql`cast(${problems.id} as text)`)) // idnex for point calc
        .where(and(eq(campusContests.eventId, eventId), eq(campusContestGroups.groupId, membership.groupId)))
        .groupBy(users.id, users.name, users.cfHandle, users.pfpUrl)
        .orderBy(desc(points));
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
        groupName: campusGroups.groupName,
        score: sql<number>`cast(${points} as int)`,
      })
      .from(campusContestParticipants)
      .innerJoin(users, eq(campusContestParticipants.userId, users.id))
      .innerJoin(campusContestGroups, eq(campusContestParticipants.contestGroupId, campusContestGroups.id)) 
      .innerJoin(campusGroups, eq(campusContestGroups.groupId, campusGroups.id)) // group name
      .innerJoin(campusContests, eq(campusContestGroups.contestId, campusContests.id)) 
      .leftJoin(campusContestSolves, eq(campusContestParticipants.id, campusContestSolves.participantId))
      .leftJoin(problems, eq(campusContestSolves.problemId, sql`cast(${problems.id} as text)`))
      .where(eq(campusContests.eventId, eventId))
      .groupBy(users.id, users.name, users.cfHandle, users.pfpUrl, campusGroups.groupName)
      .orderBy(desc(points));
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
    const [info] = await db.select().from(campusContests).where(eq(campusContests.id, contestId)).limit(1);
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
  const { type } = req.query as { type?: string };
  const userId = (req.user as any)?.id;

  try {
    // group v group
    if (type === "group-vs-group") {
      const results = await db
        .select({
          groupId: campusGroups.id,
          groupName: campusGroups.groupName,
          score: sql<number>`cast(${points} as int)`,
        })
        .from(campusContestGroups)
        .innerJoin(campusGroups, eq(campusContestGroups.groupId, campusGroups.id))
        .leftJoin(campusContestSolves, eq(campusContestGroups.id, campusContestSolves.contestGroupId)) 
        .leftJoin(problems, eq(campusContestSolves.problemId, sql`cast(${problems.id} as text)`))
        .where(eq(campusContestGroups.contestId, contestId))
        .groupBy(campusGroups.id, campusGroups.groupName)
        .orderBy(desc(points));
      res.status(200).json(results);
      return;
    }

    // intra-group
    if (type === "intra-group") {
      if (!userId) {
        res.status(401).json({ message: "auth required" });
        return;
      }
      const [membership] = await db
        .select({ contestGroupId: campusContestParticipants.contestGroupId })
        .from(campusContestParticipants)
        .innerJoin(campusContestGroups, eq(campusContestParticipants.contestGroupId, campusContestGroups.id))
        .where(and(eq(campusContestGroups.contestId, contestId), eq(campusContestParticipants.userId, userId)))
        .limit(1);

      if (!membership) {
        res.status(404).json({ message: "no group found" });
        return;
      }

      const results = await db
        .select({
          userId: users.id,
          name: users.name,
          cfHandle: users.cfHandle,
          pfpUrl: users.pfpUrl,
          score: sql<number>`cast(${points} as int)`,
        })
        .from(campusContestParticipants)
        .innerJoin(users, eq(campusContestParticipants.userId, users.id))
        .leftJoin(campusContestSolves, eq(campusContestParticipants.id, campusContestSolves.participantId))
        .leftJoin(problems, eq(campusContestSolves.problemId, sql`cast(${problems.id} as text)`))
        .where(eq(campusContestParticipants.contestGroupId, membership.contestGroupId))
        .groupBy(users.id, users.name, users.cfHandle, users.pfpUrl)
        .orderBy(desc(points));
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
        groupName: campusGroups.groupName,
        score: sql<number>`cast(${points} as int)`,
      })
      .from(campusContestParticipants)
      .innerJoin(users, eq(campusContestParticipants.userId, users.id)) 
      .innerJoin(campusContestGroups, eq(campusContestParticipants.contestGroupId, campusContestGroups.id))
      .innerJoin(campusGroups, eq(campusContestGroups.groupId, campusGroups.id))
      .leftJoin(campusContestSolves, eq(campusContestParticipants.id, campusContestSolves.participantId))
      .leftJoin(problems, eq(campusContestSolves.problemId, sql`cast(${problems.id} as text)`))
      .where(eq(campusContestGroups.contestId, contestId))
      .groupBy(users.id, users.name, users.cfHandle, users.pfpUrl, campusGroups.groupName)
      .orderBy(desc(points));
    res.status(200).json(results);
  } catch (err) {
    console.error(`error: ${err}`);
    res.status(500).json({ message: "server error" });
  }
});

export default router;
