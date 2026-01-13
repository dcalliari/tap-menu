import { afterAll, beforeAll, beforeEach } from "bun:test";
import {
	closeTestPools,
	ensureTestDatabase,
	resetDatabaseSchema,
	truncateAllTables,
} from "./database";
import { disconnectRedis, flushRedis } from "./redis";

let appPromise: Promise<any> | undefined;

export async function getApp() {
	if (!appPromise) {
		appPromise = import("@server/index").then((m) => m.app ?? m.default);
	}
	return appPromise;
}

export function setupTestHooks() {
	beforeAll(async () => {
		await ensureTestDatabase();
		await resetDatabaseSchema();
		await flushRedis();
		await getApp();
	});

	beforeEach(async () => {
		await truncateAllTables();
		await flushRedis();
	});

	afterAll(async () => {
		await disconnectRedis();
		try {
			const { db } = await import("@server/db");
			// Drizzle exposes the underlying pg Pool via $client
			await db.$client.end();
		} catch {
			// ignore
		}
		await closeTestPools();
	});
}
