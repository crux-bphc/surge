import { Request, Response, NextFunction, RequestHandler } from "express";
import { db } from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    res
      .status(401)
      .json({ success: false, message: "Authentication required." });
    return;
  }
  next();
}

export const cruxMembers = new Set<string>([
  "cwswastik",
  "Rittin_Sehgal",
  "manjot1151",
  "aten2005",
  "Yash_Kejriwal",
  "Ellufino",
  "chicubed",
]);

export const requireCruxMember: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.isAuthenticated?.() || !req.user) {
    res
      .status(401)
      .json({ success: false, message: "Authentication required." });
    return;
  }

  const userId = (req.user as { id: string }).id;
  const [dbUser] = await db.select().from(users).where(eq(users.id, userId));
  if (!dbUser) {
    res.status(401).json({ success: false, message: "User not found." });
    return;
  }

  const cfHandle = dbUser.cfHandle;
  if (!cfHandle || !cruxMembers.has(cfHandle)) {
    res
      .status(403)
      .json({ success: false, message: "Access restricted to CRUx members." });
    return;
  }

  next();
};
