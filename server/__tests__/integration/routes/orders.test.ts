import { describe, expect, it } from "bun:test";
import { expectJson } from "../../helpers/assertions";
import { makeAuthHeaders } from "../../helpers/factories";
import {
	createMenuItemFixture,
	createTableFixture,
} from "../../helpers/fixtures";
import { jsonHeaders, request } from "../../helpers/http";
import { getApp, setupTestHooks } from "../../setup/hooks";

setupTestHooks();

describe("orders routes", () => {
	it("creates an order (customer) and returns totals/items", async () => {
		const app = await getApp();
		const table = await createTableFixture({ number: "7" });
		const item = await createMenuItemFixture({ name: "Burger", price: 500 });

		const res = await request(app, "/orders", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({
				table_qr_code: table.qr_code,
				items: [{ menu_item_id: item.id, quantity: 2 }],
			}),
		});

		const json = await expectJson<any>(res, 201);
		expect(json.success).toBe(true);
		expect(json.data.order.total).toBe(1000);
		expect(json.data.items.length).toBe(1);
		expect(json.data.items[0].price_at_time).toBe(500);
	});

	it("rejects order for unknown table", async () => {
		const app = await getApp();
		const item = await createMenuItemFixture({ name: "Burger", price: 500 });

		const res = await request(app, "/orders", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({
				table_qr_code: "missing_table_qr",
				items: [{ menu_item_id: item.id, quantity: 1 }],
			}),
		});

		const json = await expectJson<any>(res, 404);
		expect(json.success).toBe(false);
		expect(json.error).toBe("Table Not Found");
	});

	it("gets order by qr code", async () => {
		const app = await getApp();
		const table = await createTableFixture({ number: "8" });
		const item = await createMenuItemFixture({ name: "Fries", price: 300 });

		const createRes = await request(app, "/orders", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({
				table_qr_code: table.qr_code,
				items: [{ menu_item_id: item.id, quantity: 1 }],
			}),
		});
		const created = await expectJson<any>(createRes, 201);
		const orderQrCode: string = created.data.order.qr_code;

		const res = await request(
			app,
			`/orders/qr/${encodeURIComponent(orderQrCode)}`,
		);
		const json = await expectJson<any>(res, 200);
		expect(json.success).toBe(true);
		expect(json.data.order.qr_code).toBe(orderQrCode);
		expect(json.data.items.length).toBe(1);
	});

	it("admin can list and update order status", async () => {
		const app = await getApp();
		const auth = await makeAuthHeaders();
		const table = await createTableFixture({ number: "9" });
		const item = await createMenuItemFixture({ name: "Soda", price: 200 });

		const createRes = await request(app, "/orders", {
			method: "POST",
			headers: jsonHeaders(),
			body: JSON.stringify({
				table_qr_code: table.qr_code,
				items: [{ menu_item_id: item.id, quantity: 1 }],
			}),
		});
		const created = await expectJson<any>(createRes, 201);
		const orderId: number = created.data.order.id;

		const listRes = await request(app, "/orders", { headers: auth });
		const listJson = await expectJson<any>(listRes, 200);
		expect(listJson.success).toBe(true);
		expect(listJson.data.length).toBe(1);

		const patchRes = await request(app, `/orders/${orderId}/status`, {
			method: "PATCH",
			headers: jsonHeaders(auth),
			body: JSON.stringify({ status: "ready" }),
		});
		const patchJson = await expectJson<any>(patchRes, 200);
		expect(patchJson.success).toBe(true);
		expect(patchJson.data.status).toBe("ready");
	});
});
