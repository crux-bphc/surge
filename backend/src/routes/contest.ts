import express from "express";
import { Request, Response } from "express";
import { Contest } from "../types/clist";
import dotenv from "dotenv";

dotenv.config();

const { CLIST_USERNAME, CLIST_SECRET } = process.env;
if (!CLIST_USERNAME || !CLIST_SECRET) {
  throw new Error("Missing CLIST credentials in environment variables");
}

const router = express.Router();
let contestsCache: Contest[] = [];

const BASE_URL = "https://clist.by:443/api/v4/contest/";
const HOST_REGEX = "^(codeforces\.com|codechef\.com|atcoder\.jp)$";

const fetchContests = async () => {
  try {
    const response = await fetch(
      BASE_URL +
        `?limit=100&host__regex=${HOST_REGEX}&order_by=-start&username=${CLIST_USERNAME}&api_key=${CLIST_SECRET}`
    );

    if (!response.ok) {
      console.log("Error: Failed to fetch from CList API!");
      return;
    }

    const data = await response.json();

    if (!data.objects || !data.meta) {
      console.log("Error: Something went wrong!");
      return;
    }

    contestsCache = data.objects as Contest[];
  } catch (error) {
    console.log(error);
  }
};

fetchContests();
//Refresh contest cache every 60 minutes
setInterval(fetchContests, 60 * 60 * 1000);

router.get("/", async (req: Request, res: Response) => {
  if (!contestsCache) {
    res.status(500).send({ error: "Internal server error" });
  }

  res.send(contestsCache);
});

router.get("/upcoming", async (req: Request, res: Response) => {
  if (!contestsCache) {
    res.status(500).send({ error: "Internal server error" });
  }

  const upcomingContests: Contest[] = contestsCache.filter(
    (contest) => new Date(contest.start) > new Date()
  );

  res.send(upcomingContests);
});

export default router;
