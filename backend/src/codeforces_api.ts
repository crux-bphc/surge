import { db } from "./drizzle/db"
import { problems, users } from "./drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { User } from "./types/codeforces";

export async function getRandomProblem() : Promise<typeof problems.$inferSelect> {

  const randomProblem = await db
    .select()
    .from(problems)
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .then(problems => problems[0]);

  if (!randomProblem) {
    throw new Error("Problem table not initialized.");
  }
  return randomProblem;
}

export async function verifySubmission(
  handle: string,
  contestId: number,
  index: string
) {
  try {
    const subs = await fetch(
      `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=5`
    );
    const result = await subs.json();
    if (result.status === "OK") {
      let verified = false;
      for (const doc of result.result) {
        if (
          doc.problem.contestId === contestId &&
          doc.problem.index === index &&
          doc.verdict === "COMPILATION_ERROR"
        ) {
          verified = true;
        }
      }
      return verified;
    } else {
      throw new Error("fetch for submission verification failed.");
    }
  } catch (err: any) {
    throw new Error(err.message);
  }
}

export async function linkCfHandle(cfHandle : string, userId : string){
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${cfHandle}`);
    const fetchedUser = await res.json();
    if (fetchedUser.status === "OK") {
      const userData = fetchedUser.result[0] as User;
      const linkedUser = await db
        .update(users)
        .set({
          cfHandle: cfHandle,
          cfRating: userData.rating,
        })
        .where(eq(users.id, userId))
      
      return linkedUser
    } else {
      throw new Error("fetch for user details failed.")
    }
  } catch(err: any) {
    throw new Error(err.message)
  }
}
