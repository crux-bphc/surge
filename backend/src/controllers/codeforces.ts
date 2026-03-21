import { db } from "../drizzle/db";
import { users } from "../drizzle/schema";
import { codeforcesQueue } from "../queues/codeforcesQueue";
import { addWithRetry } from "../utils/queueHelpers";

export async function fetchContests(priority: number = 10) {
  await addWithRetry(
    codeforcesQueue,
    "cf-job",
    {
      type: "contest.list",
      gym: true,
    },
    {
      priority,
      jobId: "gymContestsRefresh",
    }
  );
  await addWithRetry(
    codeforcesQueue,
    "cf-job",
    {
      type: "contest.list",
      gym: false,
    },
    {
      priority,
      jobId: "problemsetContestsRefresh",
    }
  );
  console.log("Queued fetching contests!");
}

export async function fetchProblems(priority: number = 10) {
  await addWithRetry(
    codeforcesQueue,
    "cf-job",
    {
      type: "problemset.problems",
    },
    {
      priority,
      jobId: "problemsRefresh",
    }
  );
  console.log("Queued fetching codeforces problems.");
}

export async function fetchUserRatingChanges(
  cfHandle: string,
  userId: string,
  priority: number = 15
) {
  await addWithRetry(
    codeforcesQueue,
    "cf-job",
    {
      type: "user.rating",
      handle: cfHandle,
      userId: userId,
    },
    {
      priority,
      jobId: `${cfHandle}-RatingRefresh`,
    }
  );
  console.log(
    `Enqueued fetchUserRatingChanges job for ${cfHandle} (Priority: ${priority})`
  );
}

export async function fetchRatingChanges() {
  const userData = await db
    .select({
      cfHandle: users.cfHandle,
      userId: users.id,
    })
    .from(users);

  for (const user of userData) {
    if (!user.cfHandle || !user.userId) continue;
    await fetchUserRatingChanges(user.cfHandle, user.userId);
  }
}

export async function fetchSubmissions() {
  const userData = await db
    .select({
      cfHandle: users.cfHandle,
      userId: users.id,
    })
    .from(users);

  for (const user of userData) {
    if (!user.cfHandle) continue;
    await fetchUserSubmissions(user.cfHandle, user.userId);
  }
}

export async function fetchUserSubmissions(
  cfHandle: string,
  userId: string,
  priority: number = 15
) {
  await addWithRetry(
    codeforcesQueue,
    "cf-job",
    {
      type: "user.submissions",
      handle: cfHandle,
      userId: userId,
    },
    {
      priority: priority,
      jobId: `${cfHandle}-SubmissionsRefresh`,
    }
  );
  console.log(
    `Enqueued fetchUserSubmissions job for ${cfHandle} (Priority: ${priority})`
  );
}

export async function refreshHistoricHandles(priority: number = 5) {
  const dateKey = new Date().toISOString().slice(0, 10); 
  const userData = await db
    .select({
      cfHandle: users.cfHandle,
      userId: users.id,
    })
    .from(users);

  for (const user of userData) {
    if (!user.cfHandle || !user.userId) continue;

    await addWithRetry(
      codeforcesQueue,
      "cf-job",
      {
        type: "user.resolveHandle",
        handle: user.cfHandle,
        userId: user.userId,
      },
      {
        priority,
        jobId: `${user.userId}-ResolveHandle-${dateKey}`,
      }
    );
  }
}
