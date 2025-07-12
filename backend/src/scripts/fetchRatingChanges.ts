// /backend/scripts/fetch-codeforces.ts
import { db, client } from "../drizzle/db";
import { userContests, users } from "../drizzle/schema";
import { RatingChange } from "../types/codeforces";

async function fetchRatingChanges(handle: string, userId: string) {
  const res = await fetch(
    `https://codeforces.com/api/user.rating?handle=${handle}`
  );
  const data = await res.json();
  if (data.status !== "OK") throw new Error("Failed to fetch");

  const fetchedRatingChanges: RatingChange[] = data.result;

  const contests = fetchedRatingChanges.map((ratingChange) => ({
    userId,
    contestId: ratingChange.contestId,
    rank: ratingChange.rank,
    oldRating: ratingChange.oldRating,
    newRating: ratingChange.newRating,
    updateTime: new Date(
      ratingChange.ratingUpdateTimeSeconds * 1000
    ).toISOString(),
  }));

  try {
    console.log("Inserting...");
    const insertedRows = await db
      .insert(userContests)
      .values(contests)
      .onConflictDoNothing();
    console.log("Done!");
    console.log("Inserted", insertedRows.rowCount, "rows");
  } catch (err) {
    console.error(err);
  }
}

async function updateUsers() {
  await client.connect();

  const userData = await db
    .select({
      cfHandle: users.cfHandle,
      userId: users.id,
    })
    .from(users);

  await Promise.all(
    userData
      .filter((data) => data.cfHandle)
      .map((user) => fetchRatingChanges(user.cfHandle!, user.userId))
  );
}

updateUsers()
  .then(() => {
    console.log("Successfully updated ratingChanges!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error updating user ratingChanges:", err);
  });
