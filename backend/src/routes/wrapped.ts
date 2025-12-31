import express from "express";
import { requireAuth, requireCruxMember } from "../middlewares/auth";
import { getWrappedStats, triggerWrappedStatsGeneration } from "../controllers/wrapped";

const router = express.Router();

router.get("/:userId", requireAuth, getWrappedStats);
router.post("/generate", requireAuth, requireCruxMember, triggerWrappedStatsGeneration);

export default router;
