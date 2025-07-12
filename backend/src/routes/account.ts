import express from "express";
import { Request, Response } from "express";
import {
  startVerificationController,
  checkVerificationController,
} from "../controllers/account";
import { validateStartVerificationRequest } from "../middlewares/account";
import { requireAuth } from "../middlewares/auth";
import {
  RatingChange,
} from "../types/codeforces";
import { db } from "../drizzle/db";
import {
  contests,
  userContests,
  users,
  submissions,
  problems,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

router.use(requireAuth);

router.post(
  "/start-verification",
  validateStartVerificationRequest,
  startVerificationController
);
router.post("/check-verification", checkVerificationController);

router.get("/:handle/ratings", async (req: Request, res: Response) => {
  const { handle } = req.params;

  const from = parseInt(req.query.from as string) as number | undefined;
  const to = parseInt(req.query.to as string) as number | undefined;

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.cfHandle, handle))
      .then((users) => users[0]);

    if (!user) {
      res.status(404).json({ error: "User not found!" });
      return;
    }

    const ratingData = await db
      .select({
        contestId: userContests.contestId,
        contestName: contests.name,
        rank: userContests.rank,
        updateTime: userContests.updateTime,
        oldRating: userContests.oldRating,
        newRating: userContests.newRating,
      })
      .from(userContests)
      .innerJoin(contests, eq(userContests.contestId, contests.externalId))
      .where(eq(userContests.userId, user.id));

    let ratingChanges: RatingChange[] = ratingData
      .filter(
        (data) =>
          data.rank !== null &&
          data.oldRating !== null &&
          data.newRating !== null
      )
      .map((data) => ({
        ...data,
        ratingUpdateTimeSeconds: Math.floor(
          new Date(data.updateTime!).getTime() / 1000
        ),
        handle,
        rank: data.rank!,
        oldRating: data.oldRating!,
        newRating: data.newRating!,
      }));

    ratingChanges = ratingChanges.filter(
      (change) =>
        (from ? change.ratingUpdateTimeSeconds >= from : true) &&
        (to ? change.ratingUpdateTimeSeconds <= to : true)
    );

    res.send(ratingChanges);
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

router.get("/:handle/submissions", async (req: Request, res: Response) => {
  const { handle } = req.params;

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.cfHandle, handle))
      .then((rows) => rows[0]);

    if (!user) {
      res.status(404).json({ error: "User not found!" });
      return;
    }

    const submissionsData = await db
      .select({
        submissionId: submissions.id,
        verdict: submissions.verdict,
        submittedAt: submissions.submittedAt,
        language: submissions.programmingLanguage,
        problemId: problems.id,
        problemName: problems.name,
        problemRating: problems.rating,
        problemIndex: problems.index,
        problemTags: problems.tags,
      })
      .from(submissions)
      .innerJoin(problems, eq(submissions.problemId, problems.id))
      .where(eq(submissions.userId, user.id));

    res.send(
      submissionsData.map((submission) => ({
        ...submission,
        creationTimeSeconds: Math.floor(
          new Date(submission.submittedAt!).getTime() / 1000
        ),
      }))
    );
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

router.get("/:handle/solved", async (req: Request, res: Response) => {
  const { handle } = req.params;

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.cfHandle, handle))
      .then((rows) => rows[0]);

    if (!user) {
      res.status(404).json({ error: "User not found!" });
      return;
    }

    const solvedProlems = await db
      .selectDistinctOn([problems.id], {
        name: problems.name,
        rating: problems.rating ?? problems.points ?? null,
        tags: problems.tags,
        dateSolved: submissions.submittedAt,
        contestId: problems.contestId,
        index: problems.index,
        verdict: submissions.verdict,
      })
      .from(submissions)
      .orderBy(problems.id, submissions.submittedAt)
      .innerJoin(problems, eq(submissions.problemId, problems.id))
      .where(eq(submissions.verdict, "AC"));

    res.send(
      solvedProlems.map((problem) => ({
        ...problem,
        dateSolved: new Date(problem.dateSolved!),
      }))
    );
  } catch (error) {
    res.status(500).send({ error: "Internal server error " + error });
  }
});

export default router;
