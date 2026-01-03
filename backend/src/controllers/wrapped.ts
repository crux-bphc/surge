import { db } from "../drizzle/db";
import { eq } from "drizzle-orm";
import { wrapped25, users } from "../drizzle/schema";
import type { Request, Response } from "express";
import { generateAllWrappedStats } from "../scripts/generateWrappedStats";

type User = typeof users.$inferSelect;

export const getWrappedStats = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    const authenticatedUser = req.user as User;
    if (authenticatedUser.id !== userId) {
        res.status(403).json({ success: false, message: "Forbidden: You can only view your own stats." });
        return;
    }

    try {
        const stats = await db.query.wrapped25.findFirst({
            where: eq(wrapped25.userId, userId),
        });

        if (!stats) {
            res.status(404).json({ success: false, message: "Wrapped stats not found for this user." });
            return;
        }

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error("Error fetching wrapped stats:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export const triggerWrappedStatsGeneration = async (req: Request, res: Response): Promise<void> => {
    try {
        await generateAllWrappedStats();
        res.status(200).json({ success: true, message: "Wrapped stats generation triggered successfully." });
    } catch (error) {
        console.error("Error triggering wrapped stats generation:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

