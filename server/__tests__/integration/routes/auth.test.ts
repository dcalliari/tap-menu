import { describe, expect, it } from "bun:test";
import { expectJson } from "../../helpers/assertions";
import { randomEmail } from "../../helpers/factories";
import { jsonHeaders, request } from "../../helpers/http";
import { getApp, setupTestHooks } from "../../setup/hooks";

setupTestHooks();

describe("auth routes", () => {
	it("registers a new user", async () => {
		const app = await getApp();
		const email = randomEmail();
		const res = await request(app, "/auth/register", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({
				name: "Test User",
				email,
				password: "password123",
			}),
		});

		const json = await expectJson<{ token: string; user: any }>(res, 201);
		expect(json.token).toBeTruthy();
		expect(json.user).toBeTruthy();
		expect(json.user.email).toBe(email);
		expect(json.user).not.toHaveProperty("password_hash");
	});

	it("rejects duplicate register", async () => {
		const app = await getApp();
		const email = randomEmail();

		await request(app, "/auth/register", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({
				name: "Test User",
				email,
				password: "password123",
			}),
		});

		const res2 = await request(app, "/auth/register", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({
				name: "Test User",
				email,
				password: "password123",
			}),
		});

		const json2 = await expectJson<{ error: string }>(res2, 409);
		expect(json2.error).toContain("Email");
	});

	it("logs in with correct credentials", async () => {
		const app = await getApp();
		const email = randomEmail();
		const password = "password123";

		await request(app, "/auth/register", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({ name: "Test User", email, password }),
		});

		const res = await request(app, "/auth/login", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({ email, password }),
		});

		const json = await expectJson<{ token: string; user: any }>(res, 200);
		expect(json.token).toBeTruthy();
		expect(json.user.email).toBe(email);
	});

	it("rejects invalid login", async () => {
		const app = await getApp();
		const res = await request(app, "/auth/login", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({
				email: randomEmail(),
				password: "wrong",
			}),
		});

		const json = await expectJson<{ error: string }>(res, 401);
		expect(json.error).toBeTruthy();
	});
});
