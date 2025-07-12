import { db, client } from "../drizzle/db"
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { resolve } from "node:path";

async function main() {
	await client.connect();

	try {
		await migrate(db, { migrationsFolder: resolve(__dirname, './drizzle') });
		console.log("Migrations run successfully!")
	} catch (err) {
		console.error("Failed to run migrations :", err);
	}
}

main()
	.then(() => process.exit(0)).catch(console.error);
