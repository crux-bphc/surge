import { db, client } from "../drizzle/db"
import {users} from "../drizzle/schema"

async function main() {
  await client.connect();
  const sampleUsers = [
    {
      email: 'sample31@hyderabad.bits-pilani.ac.in',
      name: 'Sample User 1',
      pfpUrl: 'https://example.com/avatar1.png',
      cfHandle: "sample1",
      cfRating: 1000
    },
    {
      email: 'sample32@hyderabad.bits-pilani.ac.in',
      name: 'Sample User 2',
      pfpUrl: 'https://example.com/avatar2.png',
      cfHandle: "sample2",
      cfRating: 1001
    },
    {
      email: 'sample33@hyderabad.bits-pilani.ac.in',
      name: 'Sample User 3',
      pfpUrl: 'https://example.com/avatar3.png',
      cfHandle: "sample3",
      cfRating: 1002
    }
  ];

  try {
    const result = await db
      .insert(users)
      .values(sampleUsers)
      .onConflictDoNothing();
    console.log(`${result.rowCount} users inserted!`);
  } catch (err) {
    console.error("Failed to insert:", err);
  }
}

main()
  .then(() => process.exit(0)).catch(console.error);
