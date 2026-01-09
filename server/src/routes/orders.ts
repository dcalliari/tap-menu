import { zValidator } from "@hono/zod-validator";
import { authenticateToken } from "@server/lib/auth";
import {
	createOrderSchema,
	updateOrderStatusSchema,
} from "@server/schemas/orders";
import {
	createOrder,
	getOrderById,
	getOrderByQrCode,
	getOrderItems,
	listOrders,
	updateOrderStatus,
} from "@server/services/orders";
import { Hono } from "hono";

export const ordersRoutes = new Hono()
	// Customer: create order by scanning a table QR code.
	.post("/", zValidator("json", createOrderSchema), async (c) => {
		try {
			const body = c.req.valid("json");
			const result = await createOrder(body);
			if ("error" in result) {
				return c.json(
					{ success: false, error: result.error },
					{ status: result.status },
				);
			}
			return c.json({ success: true, data: result }, 201);
		} catch (error) {
			console.error("Error creating order:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	// Customer: check status by order QR code
	.get("/qr/:qr_code", async (c) => {
		try {
			const qrCode = c.req.param("qr_code");
			const order = await getOrderByQrCode(qrCode);
			if (!order) {
				return c.json(
					{ success: false, error: "Order Not Found" },
					{ status: 404 },
				);
			}
			return c.json({ success: true, data: order });
		} catch (error) {
			console.error("Error fetching order by qr:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	// Admin: list orders
	.get("/", authenticateToken, async (c) => {
		try {
			const tableIdRaw = c.req.query("tableId");
			const tableId = tableIdRaw ? Number(tableIdRaw) : undefined;
			const status = c.req.query("status");
			const orders = await listOrders({ tableId, status });
			return c.json({ success: true, data: orders });
		} catch (error) {
			console.error("Error fetching orders:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	// Admin: get order
	.get("/:id", authenticateToken, async (c) => {
		try {
			const id = Number(c.req.param("id"));
			const order = await getOrderById(id);
			if (!order) {
				return c.json(
					{ success: false, error: "Order Not Found" },
					{ status: 404 },
				);
			}
			const items = await getOrderItems(order.id);
			return c.json({ success: true, data: { order, items } });
		} catch (error) {
			console.error("Error fetching order:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	// Admin: update status
	.patch(
		"/:id/status",
		authenticateToken,
		zValidator("json", updateOrderStatusSchema),
		async (c) => {
			try {
				const id = Number(c.req.param("id"));
				const body = c.req.valid("json");
				const updated = await updateOrderStatus(id, body.status);
				if (!updated) {
					return c.json(
						{ success: false, error: "Order Not Found" },
						{ status: 404 },
					);
				}
				return c.json({ success: true, data: updated });
			} catch (error) {
				console.error("Error updating order status:", error);
				return c.json({ error: "Internal Server Error" }, 500);
			}
		},
	);
