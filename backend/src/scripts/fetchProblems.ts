// /backend/scripts/fetch-codeforces.ts
import { db, client } from "../drizzle/db";
import { problems } from "../drizzle/schema";

async function fetchProblems() {
  const res = await fetch("https://codeforces.com/api/problemset.problems");
  const data = await res.json();
  if (data.status !== "OK") throw new Error("Failed to fetch");

  let fetchedProblems = data.result.problems;

  fetchedProblems = fetchedProblems.map(
    (problem: typeof problems.$inferInsert) => ({
      contestId: problem.contestId,
      index: problem.index,
      name: problem.name,
      rating: problem.rating ?? null,
      points: problem.points ?? null,
      tags: problem.tags,
    })
  );

  await client.connect();

  try {
    console.log("Inserting...");
    const insertedRows = await db
      .insert(problems)
      .values(fetchedProblems)
      .onConflictDoNothing();
    console.log("Done!");
    console.log("Inserted", insertedRows.rowCount, "rows");
  } catch (err) {
    console.error(err);
  }
}

fetchProblems()
  .then(() => {
    console.log("Fetched Codeforces problems.");
    process.exit(0);
  })
  .catch((err) => console.error(err));
