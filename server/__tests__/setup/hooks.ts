import { beforeAll, beforeEach } from "bun:test";
import {
	ensureTestDatabase,
	resetDatabaseSchema,
	truncateAllTables,
} from "./database";
import { flushRedis } from "./redis";

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
}
