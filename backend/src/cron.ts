import cron from "node-cron";
import {
  fetchContests,
  fetchProblems,
  fetchSubmissions,
  fetchRatingChanges,
  refreshHistoricHandles,
} from "./controllers/codeforces";

function isDec21ToJan11UTC(d: Date) {
  const month = d.getUTCMonth() + 1; 
  const day = d.getUTCDate(); 

  return (month === 12 && day >= 21) || (month === 1 && day <= 11);
}

export function startCronJobs() {
  cron.schedule("0 */2 * * *", async () => {
    console.log(
      `[Cron] Refreshing Contests and problems at ${new Date().toISOString()}`
    );
    await fetchContests();
    await fetchProblems();
  });

  cron.schedule("0 */3 * * *", async () => {
    console.log(`[Cron] Refreshing submissions at ${new Date().toISOString()}`);
    await fetchSubmissions();
  });

  cron.schedule("0 */5 * * *", async () => {
    console.log(
      `[Cron] Refreshing rating changes at ${new Date().toISOString()}`
    );
    await fetchRatingChanges();
  });

  cron.schedule("0 0 * * *", async () => {
    const now = new Date();
    if (!isDec21ToJan11UTC(now)) return;

    console.log(
      `[Cron] Refreshing historic CF handles at ${now.toISOString()}`
    );
    await refreshHistoricHandles();
  });
}
