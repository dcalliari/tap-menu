import { describe, expect, it } from "bun:test";
import { setupTestHooks, getApp } from "../../setup/hooks";
import { expectJson } from "../../helpers/assertions";
import { request } from "../../helpers/http";

setupTestHooks();

describe("root routes", () => {
	it("GET / returns basic info", async () => {
		const app = await getApp();
		const res = await request(app, "/");
		const json = await expectJson<{ message: string; environment: string }>(
			res,
			200,
		);
		expect(json.message).toBeTruthy();
		expect(json.environment).toBe("test");
	});

	it("GET /nope returns 404 JSON", async () => {
		const app = await getApp();
		const res = await request(app, "/nope");
		const json = await expectJson<{ error: string; success: boolean }>(
			res,
			404,
		);
		expect(json.success).toBe(false);
		expect(json.error).toBe("Not Found");
	});

	it("GET /health returns status + checks", async () => {
		const app = await getApp();
		const res = await request(app, "/health");
		expect([200, 503]).toContain(res.status);
		const json = await res.json();
		expect(json).toHaveProperty("database");
		expect(json.database).toBe(true);
		// redis might be unavailable locally; just assert boolean
		expect(typeof json.redis).toBe("boolean");
	});
});
