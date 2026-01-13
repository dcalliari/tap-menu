import { describe, expect, it } from "bun:test";
import { setupTestHooks, getApp } from "../../setup/hooks";
import { expectHeaderContains } from "../../helpers/assertions";
import { request } from "../../helpers/http";

setupTestHooks();

describe("qr routes", () => {
	it("returns a table QR svg", async () => {
		const app = await getApp();
		const res = await request(app, "/qr/table/test_qr.svg");
		expect(res.status).toBe(200);
		expectHeaderContains(res, "content-type", "image/svg+xml");
		const body = await res.text();
		expect(body.trimStart().startsWith("<svg")).toBe(true);
	});

	it("validates qr code length", async () => {
		const app = await getApp();
		const long = "x".repeat(201);
		const res = await request(app, `/qr/table/${long}.svg`);
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.success).toBe(false);
	});
});
