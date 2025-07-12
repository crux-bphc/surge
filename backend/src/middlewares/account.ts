import express from "express";
import { db } from "../drizzle/db";
import {users} from "../drizzle/schema";
import {eq} from "drizzle-orm";

export async function validateStartVerificationRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const { handle } = req.body;

  if (!handle) {
    res.status(400).json({ success: false, message: "Missing handle." });
    return;
  }

  const authenticatedUser = req.user as typeof users.$inferSelect;

  if (authenticatedUser.cfHandle) {
    res
      .status(400)
      .json({ success: false, message: "Handle for user is already set." });
    return;
  }

  const handleUser = await db
    .select()
    .from(users)
    .where(eq(users.cfHandle, handle))
    .limit(1)
    .then(rows => rows[0]);

  if (handleUser) {
    res
      .status(400)
      .json({
        success: false,
        message: "Handle is already linked to an account.",
      });
    return;
  }

  next();
}
