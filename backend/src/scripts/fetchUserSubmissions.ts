// /backend/scripts/fetch-codeforces.ts
import { isNotNull } from "drizzle-orm";
import { db, client } from "../drizzle/db";
import { submissions, users, problems, verdictEnum } from "../drizzle/schema";
import { Submission } from "../types/codeforces";

let problemKeysMap: Record<string, number> = {};

const verdictMap: Record<string, typeof verdictEnum.enumName> = {
  OK: "AC",
  WRONG_ANSWER: "WA",
  TIME_LIMIT_EXCEEDED: "TLE",
  RUNTIME_ERROR: "RE",
  COMPILATION_ERROR: "CE",
};

function mapVerdict(apiVerdict: string | null | undefined): string {
  if (!apiVerdict) return "other";
  return verdictMap[apiVerdict] ?? "other";
}

async function refreshProblemKeysCache() {
  const problemsData = await db
    .select({
      problemId: problems.id,
      contestId: problems.contestId,
      index: problems.index,
    })
    .from(problems);

  problemsData.forEach((problemData) => {
    const key = `${problemData.contestId}-${problemData.index}`;
    problemKeysMap[key] = problemData.problemId;
  });
}

async function fetchSubmissions(handle: string, userId: string) {
  const res = await fetch(
    `https://codeforces.com/api/user.status?handle=${handle}`
  );
  const data = await res.json();
  if (data.status !== "OK") throw new Error("Failed to fetch");

  const fetchedSubmissions: Submission[] = data.result;

  const newProblems: (typeof problems.$inferInsert)[] = [];

  fetchedSubmissions.forEach((fetchedSubmission) => {
    if (!fetchedSubmission.contestId) {
      console.log(fetchedSubmission);
      return;
    }

    const problemKey = `${fetchedSubmission.problem.contestId}-${fetchedSubmission.problem.index}`;
    if (!problemKeysMap[problemKey]) {
      newProblems.push({
        contestId: fetchedSubmission.problem.contestId!,
        index: fetchedSubmission.problem.index,
        name: fetchedSubmission.problem.name,
        rating: fetchedSubmission.problem.rating ?? null,
        points: fetchedSubmission.problem.points ?? null,
        tags: fetchedSubmission.problem.tags,
      });
    }
  });

  if (newProblems.length > 0) {
    try {
      const insertedProblems = await db
        .insert(problems)
        .values(newProblems)
        .onConflictDoNothing()
        .returning({
          id: problems.id,
          contestId: problems.contestId,
          index: problems.index,
        });

      console.log("Inserted", insertedProblems.length, "new problems!");

      insertedProblems.forEach((insertedProblem) => {
        const problemKey = `${insertedProblem.contestId}-${insertedProblem.index}`;
        problemKeysMap[problemKey] = insertedProblem.id;
      });
    } catch (err) {
      console.error("Error inserting new problems:", err);
    }
  }

  const userSubmissions = fetchedSubmissions
    .filter((fetchedSubmission) => fetchedSubmission.contestId ?? null)
    .map((fetchedSubmission) => {
      const {
        id,
        problem,
        creationTimeSeconds,
        relativeTimeSeconds,
        programmingLanguage,
        verdict,
        passedTestCount,
        timeConsumedMillis,
        memoryConsumedBytes,
      } = fetchedSubmission;
      return {
        id,
        userId,
        problemId: problemKeysMap[`${problem.contestId}-${problem.index}`],
        submittedAt: new Date(creationTimeSeconds * 1000).toISOString(),
        relativeTimeSeconds:
          relativeTimeSeconds == 2147483647 ? 0 : relativeTimeSeconds,
        programmingLanguage,
        verdict: mapVerdict(verdict),
        passedTestCount,
        timeConsumedMillis,
        memoryKb: Math.floor(memoryConsumedBytes / 1000),
      } as typeof submissions.$inferInsert;
    });

  try {
    console.log("Inserting...");
    const insertedRows = await db
      .insert(submissions)
      .values(userSubmissions)
      .onConflictDoNothing();
    console.log("Done!");
    console.log("Inserted", insertedRows.rowCount, "rows");
  } catch (err) {
    console.error("Error inserting submissions:", err);
  }
}

async function updateUsers() {
  await client.connect();

  await refreshProblemKeysCache();

  const userData = await db
    .select({
      cfHandle: users.cfHandle,
      userId: users.id,
    })
    .from(users);

  await Promise.all(
    userData
      .filter((data) => data.cfHandle)
      .map((user) => fetchSubmissions(user.cfHandle!, user.userId))
  );
}

updateUsers()
  .then(() => {
    console.log("Successfully updated user submissions!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error updating user user submissions:", err);
  });
