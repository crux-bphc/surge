import express from "express";
import { requireAuth, requireCruxMember } from "../middlewares/auth";
import { getWrappedLeaderboard, getWrappedStats, triggerWrappedStatsGeneration } from "../controllers/wrapped";

const router = express.Router();

router.get("/leaderboard", requireAuth, getWrappedLeaderboard);
router.post("/generate", requireAuth, requireCruxMember, triggerWrappedStatsGeneration);
router.get("/:userId", requireAuth, getWrappedStats);

export default router;
