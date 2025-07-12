import { db, client } from "../drizzle/db";
import { contests } from "../drizzle/schema";
import { Contest } from "../types/codeforces";

async function fetchContests() {
  const res = await fetch("https://codeforces.com/api/contest.list?gym=true");
  const data = await res.json();

  if (data.status !== "OK") throw new Error("Failed to fetch contests");

  const fetchedContests: Contest[] = data.result;
  const formattedContests = fetchedContests.map(
    (contest): typeof contests.$inferInsert => ({
      externalId: contest.id,
      name: contest.name,
      startTime: contest.startTimeSeconds
        ? new Date(contest.startTimeSeconds * 1000).toISOString()
        : null,
      durationMinutes: contest.durationSeconds / 60,
      url: `https://codeforces.com/contest/${contest.id}`,
    })
  );

  await client.connect();

  try {
    await db.insert(contests).values(formattedContests).onConflictDoNothing();
  } catch (err) {
    console.log("Error inserting contests:", err);
  }
}

fetchContests()
  .then(() => {
    console.log("Fetched Contests!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error fetching contests:", err);
  });
