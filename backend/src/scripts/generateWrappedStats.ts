import { db, client } from "../drizzle/db";
import { users, submissions, problems, userContests, potdSolves, wrapped25 } from "../drizzle/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";

async function generateStats(user: (typeof users)['$inferSelect']) {
    console.log(`Generating stats for ${user.name} (${user.cfHandle})`);

    const year = 2025;
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`)


    const userSubmissions = await db.query.submissions.findMany({
        where: and(eq(submissions.userId, user.id),
            gte(submissions.submittedAt, startDate.toISOString()),
            lte(submissions.submittedAt, endDate.toISOString())
        )
    });

    const submissionCount = userSubmissions.length;
    if (submissionCount === 0) {
        console.log(`No submissions for ${user.name}, skipped`);
        return null;
    }

    const solvedSubmissions = userSubmissions.filter(s => s.verdict === "AC");
    const solvedCount = solvedSubmissions.length;
    const accuracy = solvedCount / submissionCount;

    const monthlySolves: Record<string, { month: string, label: string, solvedCount: number }> = {};
    for (const sub of solvedSubmissions) {
        if (!sub.submittedAt) continue;
        const month = sub.submittedAt.substring(0, 7);
        const monthDate = new Date(sub.submittedAt);
        const monthLabel = monthDate.toLocaleString('default', { month: 'short' });

        if (!monthlySolves[month]) {
            monthlySolves[month] = { month: month, label: monthLabel, solvedCount: 0 };
        }

        monthlySolves[month].solvedCount++;
    }

    const solvedProblemIds = solvedSubmissions.map(s => s.problemId);
    let topTags: string[] = [];

    if (solvedProblemIds.length > 0) {
        const solvedProblems = await db
            .select({ tags: problems.tags })
            .from(problems)
            .where(inArray(problems.id, solvedProblemIds));

        const mostSolvedTags = solvedProblems
            .flatMap(p => p.tags)
            .reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        topTags = Object.entries(mostSolvedTags).sort((a, b) => b[1] - a[1]).slice(0, 5).map(a => a[0]);
    }

    const dailySolves = new Set(solvedSubmissions.map(s => s.submittedAt!.substring(0, 10)));
    let longestStreak = 0;
    if (dailySolves.size > 0) {
        const sortedDates = Array.from(dailySolves).sort();
        let currentStreak = 1;
        longestStreak = 1;
        let lastDate = new Date(sortedDates[0]);

        for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const diff = (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
            if (diff === 1) {
                currentStreak++;
            } else if (diff > 1) {
                currentStreak = 1;
            }
            longestStreak = Math.max(longestStreak, currentStreak);
            lastDate = currentDate;
        }
    }

    const userContestsData = await db.query.userContests.findMany({
        where: and(
            eq(userContests.userId, user.id),
            gte(userContests.updateTime, startDate.toISOString()),
            lte(userContests.updateTime, endDate.toISOString())
        ),
        orderBy: (userContests, { asc }) => [asc(userContests.updateTime)]
    });

    const contestCount = userContestsData.length;
    const baseRating = user.cfRating ?? 0;
    const initialRating = userContestsData[0]?.oldRating ?? baseRating;
    const finalRating = userContestsData[userContestsData.length - 1]?.newRating ?? baseRating;

    let highestRating = initialRating; 
    if (userContestsData.length > 0) {
        const allRatingsInPeriod = userContestsData.map(contest => contest.newRating ?? 0);
        highestRating = Math.max(...allRatingsInPeriod, initialRating);
    }
    highestRating = Math.max(highestRating, user.cfRating ?? 0);

    const userPotdSolves = await db.query.potdSolves.findMany({
        where: and(
            eq(potdSolves.userId, user.id),
            gte(potdSolves.solvedAt, startDate.toISOString()),
            lte(potdSolves.solvedAt, endDate.toISOString())
        )
    });
    const potdSolveCount = userPotdSolves.length;

    return {
        userId: user.id,
        submissionCount,
        solvedCount,
        monthlySolves: Object.values(monthlySolves),
        accuracy,
        mostSolvedTags: topTags,
        longestStreak,
        contestCount,
        initialRating,
        finalRating,
        highestRating,
        potdSolves: potdSolveCount,
        campusRank: 0,
        batchRank: 0
    };
}

async function calculateRanks() {
    console.log("Calculating ranks");

    const allWrappedStats = await db.query.wrapped25.findMany();

    if (allWrappedStats.length === 0) {
        console.log("No wrapped stats to rank.");
        return;
    }

    const allUserIds = allWrappedStats.map(stat => stat.userId);
    const allUsers = await db.select().from(users).where(inArray(users.id, allUserIds));
    const userMap = new Map(allUsers.map(user => [user.id, user]));

    const combinedStats = allWrappedStats.map(stat => {
        const user = userMap.get(stat.userId);
        if (!user) return undefined;
        return { ...stat, user};
    }).filter(Boolean) as Array<typeof allWrappedStats[number] & { user: typeof users.$inferSelect }> ;

    if (combinedStats.length === 0 ){
        console.log("no valid combined stats to rank after filtering");
        return;
    }

    const sortedByRating = combinedStats
        .filter(s => s.user.cfRating !== null)
        .sort((a, b) => b.user.cfRating! - a.user.cfRating!);

    const rankUpdates = sortedByRating.map((stat, i) =>
        db.update(wrapped25).set({ campusRank: i + 1 }).where(eq(wrapped25.id, stat.id))
    );
    await Promise.all(rankUpdates);

    const batches: Record<string, (typeof combinedStats)> = {};
    for (const stat of combinedStats) {
        const match = stat.user.email.match(/f(\d{4})/);
        if (match) {
            const batch = match[1];
            if (!batches[batch]) {
                batches[batch] = [];
            }
            batches[batch].push(stat);
        }
    }

    const batchRankUpdates = [];
    for (const batch in batches) {
        const sortedBatch = batches[batch]
            .filter(s => s.user.cfRating !== null)
            .sort((a, b) => b.user.cfRating! - a.user.cfRating!);

        for (let i = 0; i < sortedBatch.length; i++) {
            const stat = sortedBatch[i];
            batchRankUpdates.push(
                db.update(wrapped25).set({ batchRank: i + 1 }).where(eq(wrapped25.id, stat.id))
            );
        }
    }
    await Promise.all(batchRankUpdates);

    console.log("Ranks calculated");
}

export async function generateAllWrappedStats() {
    console.log("Generating wrapped stats for all users");
    const allUsers = await db.query.users.findMany();

    const allStats = [];
    for (const user of allUsers) {
        const stats = await generateStats(user);
        if (stats) {
            allStats.push(stats);
        }
    }

    if (allStats.length > 0) {
        await db.insert(wrapped25).values(allStats).onConflictDoNothing();

        for (const stats of allStats) {
            await db.update(wrapped25).set({
                submissionCount: stats.submissionCount,
                solvedCount: stats.solvedCount,
                monthlySolves: stats.monthlySolves,
                accuracy: stats.accuracy,
                mostSolvedTags: stats.mostSolvedTags,
                longestStreak: stats.longestStreak,
                contestCount: stats.contestCount,
                initialRating: stats.initialRating,
                finalRating: stats.finalRating,
                highestRating: stats.highestRating,
                potdSolves: stats.potdSolves
            }).where(eq(wrapped25.userId, stats.userId));
        }
    }

    await calculateRanks();

    console.log("Wrapped stats generation complete!");
}

async function main() {
    await client.connect();
    await generateAllWrappedStats();
    await client.end();
    process.exit(0);
}

if (require.main === module) {
    main().catch(async e => {
        console.error(e);
        await client.end();
        process.exit(1);
    });
}

