import { Worker } from "bullmq";
import { connection } from "../queues/codeforcesQueue";
import { RatingChange, Submission } from "../types/codeforces";
import { db } from "../drizzle/db";
import { problems } from "../drizzle/schema";
import {
  addCodeforcesProblems,
  addCodeforcesSubmissions,
  updateContests,
  updateProblems,
  updateUserRatings,
} from "../utils/dbHelpers";
import { linkCfHandle } from "../codeforces_api";
import { syncEventLeaderboard } from "../utils/eventHelpers";

//Keep track of problem key to problem id relations in local map
//Problem key is contestId-problemIndex, like 2323-B, 122-C, etc.
let problemKeysMap: Record<string, number> = {};

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

async function init() {
  await refreshProblemKeysCache();

  console.log("Connected to postgres");

  const worker = new Worker(
    "cf-api",
    async (job) => {
      const { type, handle, userId, gym } = job.data;

      let url: string;
      if (type === "user.rating") {
        url = `https://codeforces.com/api/user.rating?handle=${handle}`;
      } else if (type === "user.submissions") {
        url = `https://codeforces.com/api/user.status?handle=${handle}`;
      } else if (type === "user.resolveHandle") {
        //This returns unlike the other ones as the url logic is already handled in linkCfHandle() function itself so I'm just calling the function directly.
        await linkCfHandle(handle, userId);
        return;
      } else if (type === "problemset.problems") {
        url = `https://codeforces.com/api/problemset.problems`;
      } else if (type === "contest.list") {
        url = `https://codeforces.com/api/contest.list?gym=${gym ? "true" : "false"}`;
      } else if (type === "event.sync") {
        const { contestId } = job.data;
        await syncEventLeaderboard(contestId);
        return;
      } else {
        throw new Error(`Unsupported job type: ${type}`);
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== "OK") {
        if (data.comment.includes("not found")) {
          //This means there exists no user with this handle
          //permanent failure no need to retry
          return;
        }
        throw new Error("CodeForces API Error!");
      }

      if (type === "user.rating") {
        const fetchedRatingChanges: RatingChange[] = data.result;
        await updateUserRatings(fetchedRatingChanges, userId, handle);
      } else if (type === "user.submissions") {
        const fetchedSubmissions: Submission[] = data.result;
        const fetchedProblems = fetchedSubmissions.map(
          (submission) => submission.problem
        );
        await addCodeforcesProblems(fetchedProblems);
        await addCodeforcesSubmissions(fetchedSubmissions, userId, handle);
      } else if (type === "problemset.problems") {
        const fetchedProblems = data.result.problems;
        await updateProblems(fetchedProblems);
      } else if (type === "contest.list") {
        const fetchedContests = data.result;
        await updateContests(fetchedContests);
      }
    },
    {
      connection,
      concurrency: 1,
      limiter: {
        max: 1,
        duration: 2000,
      },
    }
  );

  worker.on("failed", (job, err) => {
    console.log(`${job!.id} has failed with ${err.message}`);
  });

  worker.on("active", (job) => {
    console.log(`Active: Job ${job.id} (${job.data.type})`);
  });

  worker.on("stalled", (jobId) => {
    console.warn(`⚠️ Job ${jobId} is stalled`);
  });

  worker.on("error", (err) => {
    console.error("💥 Worker error:", err);
  });
}

init().catch((err) => {
  console.error("❌ Worker failed to start:", err);
  process.exit(1);
});
