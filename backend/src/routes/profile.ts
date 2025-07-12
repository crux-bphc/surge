import express from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../middlewares/auth";
import { getUserByHandle } from "../utils/users";
import { users } from "../drizzle/schema";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const authenticatedUser = req.user as typeof users.$inferSelect;
    const { name, cfHandle, email, pfpUrl } = authenticatedUser;
    if (!cfHandle) {
      res
        .status(500)
        .json({ success: false, message: "CodeForces account not linked!" });
      return;
    }
    const userData = await getUserByHandle(cfHandle);
    if (!userData) {
      res.status(500).json({ success: false, message: "User not found!" });
      return;
    }
    res.status(200).json({
      name,
      email,
      pfpUrl,
      cfHandle,
      cfRating: userData.cfRating,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  try {
    const userData = await getUserByHandle(slug);
    if (!userData) {
      res.status(404).json({ success: false, message: "User not found!" });
      return;
    }
    res.status(200).json(userData);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
