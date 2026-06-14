import { client, db } from "../drizzle/db";
import { events } from "../drizzle/schema";

async function init() {
  await client.connect();
  console.log("attempting insert");
  const result = await db.insert(events).values({
    name: "Summer of CC 2026",
    desc: "Summer competitive coding event for 2026",
  }).returning();
  console.log("insert result:", result);
  await client.end();
}

init().then(() => {
  console.log("done");
  process.exit(0);
}).catch((err) => {
  console.error("error:", err);
  process.exit(1);
});