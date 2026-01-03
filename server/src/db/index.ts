import { env } from "@server/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString =
	env.NODE_ENV === "test" ? env.TEST_DATABASE_URL : env.DATABASE_URL;

const pool = new Pool({
	connectionString,
});

export const db = drizzle({
	client: pool,
	schema: schema,
	logger: env.NODE_ENV === "development",
});

export async function checkDatabase(): Promise<boolean> {
	try {
		await db.$client.query("SELECT 1");
		return true;
	} catch (error) {
		console.error("Database health check failed:", error);
		return false;
	}
}

export { schema };
