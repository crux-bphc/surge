import { Router } from "express";
import {
  getCurrentPotd,
  schedulePotd,
  getScheduledPotd,
  verifyPotdSolve,
  getSolveHistory,
} from "../controllers/potd";
import { requireAuth, requireCruxMember } from "../middlewares/auth";

const router = Router();

// scheduling endpoints (crux only)
router.post("/schedule", requireCruxMember, schedulePotd);
router.get("/schedule", requireCruxMember, getScheduledPotd);

router.get("/current", requireAuth, getCurrentPotd);
router.post("/verify-solve", requireAuth, verifyPotdSolve);
router.get("/solve-history", requireAuth, getSolveHistory);

export default router;
