import { db } from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function getUserByHandle(cfHandle: string) {
  try {
    let user: typeof users.$inferSelect = await db
      .select()
      .from(users)
      .where(eq(users.cfHandle, cfHandle))
      .limit(1)
      .then((users) => users[0]);

    if (user) {
      return user;
    } else {
      return null;
    }
  } catch (err: any) {
    throw new Error(err.message);
  }
}

export async function getUserById(userId: string) {
  try {
    let user: typeof users.$inferSelect = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((users) => users[0]);

    if (user) {
      return user;
    } else {
      return null;
    }
  } catch (err: any) {
    throw new Error(err.message);
  }
}
