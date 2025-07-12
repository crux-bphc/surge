import { db, client } from "../drizzle/db"
import {users} from "../drizzle/schema"

async function main() {
	await client.connect();

	try {
		await db
			.delete(users);
		console.log("Cleared all users!")
	} catch (err) {
		console.error("Failed to insert:", err);
	}
}

main()
	.then(() => process.exit(0)).catch(console.error);
