import express from "express";
import { Request, Response } from "express";
import {
  startVerificationController,
  checkVerificationController,
} from "../controllers/account";
import { validateStartVerificationRequest } from "../middlewares/account";
import { requireAuth } from "../middlewares/auth";
import { RatingChange, SolvedProblem, Submission, User } from "../types/codeforces";

const router = express.Router();
const BASE_URL = "https://codeforces.com/api/"

router.use(requireAuth);

router.post(
  "/start-verification",
  validateStartVerificationRequest,
  startVerificationController
);
router.post("/check-verification", checkVerificationController);

router.get("/:handle/stats", async (req: Request, res: Response) => {
  const {handle} = req.params;

  try {
    const response = await fetch(BASE_URL + `user.info?handles=${handle}`)

    if(!response.ok){
      res.status(response.status).send({error: 'Failed to fetch from CodeForces API'});
    }

    const data = await response.json();

    if(data.status !== 'OK' || !data.result || !data.result[0]){
      res.status(404).send({error: 'CodeForces user not found!'});
    }

    const user : User = data.result[0];

    res.send(user);
  } catch(error) {
    res.status(500).send({error: "Internal server error"});
  }

})

router.get("/:handle/ratings", async (req: Request, res: Response) => {
  const {handle} = req.params;

  const from = parseInt(req.query.from as string) as number | undefined;
  const to = parseInt(req.query.to as string) as number | undefined;  

  try {
    const response = await fetch(BASE_URL + `user.rating?handle=${handle}`);

    if(!response.ok){
      res.status(response.status).send({error: 'Failed to fetch from CodeForces API'});
    }

    const data = await response.json();

    if(data.status !== 'OK' || !data.result){
      res.status(404).send({error: "CodeForces user not found!"});
    }

    let ratingChanges : RatingChange[] = data.result;

    ratingChanges = ratingChanges.filter(change => 
      (from ? change.ratingUpdateTimeSeconds >= from : true) &&
      (to ? change.ratingUpdateTimeSeconds <= to: true)
    )

    res.send(ratingChanges);
  } catch(error) {
    res.status(500).send({error: "Internal server error"});
  }
})

router.get("/:handle/submissions", async (req: Request, res: Response) => {
  const {handle} = req.params;

  const start = parseInt(req.query.from as string) as number | undefined;
  const count = parseInt(req.query.count as string) as number | undefined;  

  try {
    const response = await fetch(BASE_URL + `user.status?handle=${handle}` 
      + (start ? `&from=${start}` : "")
      + (count ? `&count=${count}` : ""));

    if(!response.ok){
      res.status(response.status).send({error: 'Failed to fetch from CodeForces API'});
    }

    const data = await response.json();

    if(data.status !== 'OK' || !data.result){
      res.status(404).send({error: "CodeForces user not found!"});
    }

    const submissions : Submission[] = data.result;

    res.send(submissions);
  } catch(error) {
    res.status(500).send({error: "Internal server error"});
  }
})

router.get("/:handle/solved", async (req: Request, res: Response) => {
  const {handle} = req.params;

  const start = parseInt(req.query.from as string) as number | undefined;
  const count = parseInt(req.query.count as string) as number | undefined;  

  try {
    const response = await fetch(BASE_URL + `user.status?handle=${handle}` 
      + (start ? `&from=${start}` : "")
      + (count ? `&count=${count}` : ""));

    if(!response.ok){
      res.status(response.status).send({error: 'Failed to fetch from CodeForces API'});
    }

    const data = await response.json();

    if(data.status !== 'OK' || !data.result){
      res.status(404).send({error: "CodeForces user not found!"});
    }

    const submissions : Submission[] = data.result;

    const solvedMap = new Map<string, SolvedProblem>();

    submissions
    .filter(s => s.verdict === 'OK')
    .forEach(submission => {
      const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
      
      if (!solvedMap.has(problemKey) && submission.verdict) {
        solvedMap.set(problemKey, {
          name: submission.problem.name,
          rating: submission.problem.rating,
          tags: submission.problem.tags,
          dateSolved: new Date(submission.creationTimeSeconds * 1000),
          contestId: submission.problem.contestId,
          index: submission.problem.index,
          verdict: submission.verdict
        });
      }
    });

    res.send(Array.from(solvedMap.values()).sort((a, b) => 
      b.dateSolved.getTime() - a.dateSolved.getTime()
    ))

  } catch(error) {
    res.status(500).send({error: "Internal server error"});
  }
})

export default router;
