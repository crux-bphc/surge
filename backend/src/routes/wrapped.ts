import express from "express";
import { requireAuth } from "../middlewares/auth";
import { getWrappedStats } from "../controllers/wrapped";

const router = express.Router();

router.get("/:userId", requireAuth, getWrappedStats);

export default router;
