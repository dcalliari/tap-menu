import { describe, expect, it } from "bun:test";
import { expectHeaderContains, expectJson } from "../../helpers/assertions";
import { makeAuthHeaders } from "../../helpers/factories";
import { jsonHeaders, request } from "../../helpers/http";
import { getApp, setupTestHooks } from "../../setup/hooks";

setupTestHooks();

describe("tables routes", () => {
	it("requires auth to create table", async () => {
		const app = await getApp();
		const res = await request(app, "/tables", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({ number: "1" }),
		});
		expect(res.status).toBe(401);
	});

	it("creates table with auth and can list", async () => {
		const app = await getApp();
		const auth = await makeAuthHeaders();

		const createRes = await request(app, "/tables", {
			method: "POST",
			headers: jsonHeaders(auth),
			body: JSON.stringify({ number: "1" }),
		});

		const created = await expectJson<any>(createRes, 201);
		expect(created.success).toBe(true);
		expect(created.data.number).toBe("1");

		const listRes = await request(app, "/tables", {
			headers: auth,
		});
		const listJson = await expectJson<any>(listRes, 200);
		expect(listJson.success).toBe(true);
		expect(listJson.data.length).toBe(1);
	});

	it("looks up table by qr code", async () => {
		const app = await getApp();
		const auth = await makeAuthHeaders();

		const createRes = await request(app, "/tables", {
			method: "POST",
			headers: jsonHeaders(auth),
			body: JSON.stringify({ number: "10" }),
		});
		const created = await expectJson<any>(createRes, 201);
		const qrCode: string = created.data.qr_code;

		const byQrRes = await request(
			app,
			`/tables/qr/${encodeURIComponent(qrCode)}`,
		);
		const byQrJson = await expectJson<any>(byQrRes, 200);
		expect(byQrJson.success).toBe(true);
		expect(byQrJson.data.number).toBe("10");
	});

	it("returns svg for /tables/:id/qr.svg", async () => {
		const app = await getApp();
		const auth = await makeAuthHeaders();

		const createRes = await request(app, "/tables", {
			method: "POST",
			headers: jsonHeaders(auth),
			body: JSON.stringify({ number: "2" }),
		});
		const created = await expectJson<any>(createRes, 201);

		const svgRes = await request(app, `/tables/${created.data.id}/qr.svg`, {
			headers: auth,
		});
		expect(svgRes.status).toBe(200);
		expectHeaderContains(svgRes, "content-type", "image/svg+xml");
		const body = await svgRes.text();
		expect(body.trimStart().startsWith("<svg")).toBe(true);
	});
});
