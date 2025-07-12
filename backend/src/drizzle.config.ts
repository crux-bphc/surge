import {config} from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "../../.env"});

export default defineConfig({
	dialect: "postgresql",
	out: "./drizzle",
	schema: "./drizzle/schema.ts",
	dbCredentials: {
    host: "localhost",
    port: Number(process.env.PGPORT!),
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DB!,
		ssl: false
	},
	verbose: true,
	strict: true
});
