import { db } from "../drizzle/db";
import {
  eventContests,
  eventContestsScore,
  eventGroups,
  eventParticipants,
  users,
} from "../drizzle/schema";
import { eq, sql, and } from "drizzle-orm";
import crypto from "crypto";

function getProblemWeight(index: string): number {
  // const firstChar = index.charAt(0).toUpperCase();
  // const weight = firstChar.charCodeAt(0) - 64;
  const weight = 1;
  return weight > 0 ? weight : 0;
}

function generateCfUrl(methodName: string, params: Record<string, any>) {
  const apiKey = process.env.CF_API_KEY;
  const apiSecret = process.env.CF_API_SECRET;

  if (!apiKey || !apiSecret) { // if no key n secret try using normal api call
    const cleanParams = { ...params };
    delete cleanParams.asManager; 
    const paramStr = Object.entries(cleanParams).map(([k, v]) => `${k}=${v}`).join("&");
    return `https://codeforces.com/api/${methodName}?${paramStr}`;
  }

  const time = Math.floor(Date.now() / 1000);
  const allParams: Record<string, any> = { ...params, apiKey, time };
  const sortedKeys = Object.keys(allParams).sort();
  const paramStr = sortedKeys.map((k) => `${k}=${allParams[k]}`).join("&");
  const rand = Math.floor(Math.random() * 899999 + 100000).toString();
  const signatureStr = `${rand}/${methodName}?${paramStr}#${apiSecret}`;
  const hash = crypto.createHash("sha512").update(signatureStr).digest("hex");

  return `https://codeforces.com/api/${methodName}?${paramStr}&apiSig=${rand}${hash}`;
}

export async function getContestMetadata(contestId: number) {
  const url = generateCfUrl("contest.standings", {contestId, from: 1, count: 1, showUnofficial: false, asManager: true, });
  const cfRes = await fetch(url);
  const data = await cfRes.json();

  if (data.status !== "OK") {
    throw new Error(`Codeforces API error: ${data.comment}`);
  }

  const { contest } = data.result;
  return {
    id: contest.id,
    name: contest.name,
    durationSeconds: contest.durationSeconds,
    startTimeSeconds: contest.startTimeSeconds,
    startTimeFormatted: new Date(contest.startTimeSeconds * 1000).toISOString(),
    startTime: new Date(contest.startTimeSeconds * 1000).toISOString(),
    durationMinutes: Math.round(contest.durationSeconds / 60),
  };
}

export async function syncEventLeaderboard(contestId: number) {
  const [contest] = await db.select().from(eventContests).where(eq(eventContests.id, contestId)).limit(1);

  if (!contest) {
    throw new Error(`Contest ${contestId} not found in event_contests`);
  }

  const url = generateCfUrl("contest.standings", {contestId: contest.id, from: 1, showUnofficial: false, asManager: true, });

  const cfRes = await fetch(url);
  const data = await cfRes.json();

  if (data.status !== "OK") {
    throw new Error(`Codeforces API error: ${data.comment}`);
  }

  const { problems: cfProblems, rows } = data.result;

  // mapping handles
  const participants = await db
    .select({
      id: eventParticipants.id,
      cfHandle: users.cfHandle,
      groupId: eventParticipants.groupId,
    })
    .from(eventParticipants)
    .innerJoin(users, eq(eventParticipants.userId, users.id))
    .where(eq(eventParticipants.eventId, contest.eventId));

  // map is better for performance since its o(1) or sth apparently. - ty gork
  // basically we check against the row that cf standings gives to find our participants 
  // and store their score in scoresToInsert and then batch update 
  const handleToParticipant = new Map(
    participants.map((p) => [p.cfHandle?.toLowerCase().trim(), p])
  );
  console.log(`found ${participants.length} registered participants for event ${contest.eventId}`);
  
  // calc scores
  const scoresToInsert: (typeof eventContestsScore.$inferInsert)[] = [];
  let matchedCount = 0;
  for (const row of rows) {
    const handle = row.party.members[0].handle.toLowerCase().trim();
    const participant = handleToParticipant.get(handle);
    if (participant) {
      matchedCount++;
      let totalScore = 0;
      row.problemResults.forEach((result: any, index: number) => {
        // if points > 0 or they solved it
        const isSolved = result.points > 0;
        if (isSolved) {
          const weight = getProblemWeight(cfProblems[index].index);
          totalScore += weight;
        }
      });
      scoresToInsert.push({
        participantId: participant.id,
        contestId: contestId,
        contestScore: totalScore,
      });
    } 
  }
  console.log(`matched ${matchedCount}/${rows.length} contest rows to registered participants`);

  await db.transaction(async (tx) => {   // helps w data consistency, if one fails it goes back to prev state
    // drop earlier scores so contest can handle banned/moved users
    await tx
      .delete(eventContestsScore)
      .where(eq(eventContestsScore.contestId, contestId));

    if (scoresToInsert.length > 0) {
      await tx.insert(eventContestsScore).values(scoresToInsert);
    }

    // 1. Update participant scores
    await tx.execute(sql`
      UPDATE event_participants
      SET participant_score = (
        SELECT COALESCE(SUM(contest_score), 0)
        FROM event_contests_score
        WHERE event_contests_score.participant_id = event_participants.id
      )
      WHERE event_participants.event_id = ${contest.eventId}
    `);

    // 2. Update group scores based on the new participant scores
    await tx.execute(sql`
      UPDATE event_groups
      SET group_score = (
        SELECT COALESCE(SUM(participant_score), 0)
        FROM event_participants
        WHERE event_participants.group_id = event_groups.id
      )
      WHERE event_groups.event_id = ${contest.eventId}
    `);
  });
}
