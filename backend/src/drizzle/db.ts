import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';

export const client = new Client({
  host: process.env.POSTGRES_HOST!,
  port: Number(process.env.PGPORT!),
  user: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
  database: process.env.POSTGRES_DB!,
	ssl: false
});

// { schema } is used for relational queries
export const db = drizzle({ client, schema });
