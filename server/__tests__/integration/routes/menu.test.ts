import { describe, expect, it } from "bun:test";
import { setupTestHooks, getApp } from "../../setup/hooks";
import { expectJson } from "../../helpers/assertions";
import { request, jsonHeaders } from "../../helpers/http";
import { makeAuthHeaders } from "../../helpers/factories";
import {
	createMenuCategoryFixture,
	createMenuItemFixture,
} from "../../helpers/fixtures";

setupTestHooks();

describe("menu routes", () => {
	it("lists categories (public)", async () => {
		const app = await getApp();
		await createMenuCategoryFixture({ name: "Burgers" });

		const res = await request(app, "/menu/categories");
		const json = await expectJson<any>(res, 200);
		expect(json.success).toBe(true);
		expect(Array.isArray(json.data)).toBe(true);
		expect(json.data.length).toBe(1);
	});

	it("requires auth to create category", async () => {
		const app = await getApp();
		const res = await request(app, "/menu/categories", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({ name: "Drinks" }),
		});
		expect(res.status).toBe(401);
	});

	it("creates category with auth", async () => {
		const app = await getApp();
		const auth = await makeAuthHeaders();
		const res = await request(app, "/menu/categories", {
			method: "POST",
			headers: jsonHeaders(auth),
			body: JSON.stringify({ name: "Drinks" }),
		});
		const json = await expectJson<any>(res, 201);
		expect(json.success).toBe(true);
		expect(json.data.name).toBe("Drinks");
	});

	it("lists items filtered by categoryId", async () => {
		const app = await getApp();
		const catA = await createMenuCategoryFixture({ name: "A" });
		const catB = await createMenuCategoryFixture({ name: "B" });
		await createMenuItemFixture({ name: "ItemA", price: 100, category_id: catA.id });
		await createMenuItemFixture({ name: "ItemB", price: 100, category_id: catB.id });

		const res = await request(app, `/menu/items?categoryId=${catA.id}`);
		const json = await expectJson<any>(res, 200);
		expect(json.success).toBe(true);
		expect(json.data.length).toBe(1);
		expect(json.data[0].name).toBe("ItemA");
	});
});
