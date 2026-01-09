import { db } from "@server/db";
import {
	menuItemsInTapMenu,
	orderItemsInTapMenu,
	ordersInTapMenu,
	tablesInTapMenu,
} from "@server/db/schema";
import { generateQrCode } from "@server/lib/ids";
import { and, eq, inArray } from "drizzle-orm";

type CreateOrderInput = {
	table_qr_code: string;
	items: Array<{ menu_item_id: number; quantity: number; notes?: string }>;
};

export async function createOrder(input: CreateOrderInput) {
	const [table] = await db
		.select()
		.from(tablesInTapMenu)
		.where(eq(tablesInTapMenu.qr_code, input.table_qr_code))
		.limit(1);

	if (!table)
		return { error: "Table Not Found" as const, status: 404 as const };

	const menuItemIds = [...new Set(input.items.map((i) => i.menu_item_id))];
	const menuItems = await db
		.select()
		.from(menuItemsInTapMenu)
		.where(inArray(menuItemsInTapMenu.id, menuItemIds));

	if (menuItems.length !== menuItemIds.length) {
		return {
			error: "One or more menu items not found" as const,
			status: 400 as const,
		};
	}

	const menuItemById = new Map(menuItems.map((mi) => [mi.id, mi] as const));

	for (const item of input.items) {
		const menuItem = menuItemById.get(item.menu_item_id);
		if (!menuItem) {
			return {
				error: "One or more menu items not found" as const,
				status: 400 as const,
			};
		}
		if (!menuItem.is_available) {
			return {
				error: `Menu item not available: ${menuItem.name}` as const,
				status: 400 as const,
			};
		}
	}

	return await db.transaction(async (tx) => {
		let total = 0;
		for (const item of input.items) {
			const menuItem = menuItemById.get(item.menu_item_id);
			if (!menuItem) {
				throw new Error("Menu item missing during total calculation");
			}
			total += menuItem.price * item.quantity;
		}

		const orderQrCode = generateQrCode("order");

		const [createdOrder] = await tx
			.insert(ordersInTapMenu)
			.values({
				table_id: table.id,
				qr_code: orderQrCode,
				total,
			})
			.returning();

		if (!createdOrder) {
			throw new Error("Failed to create order");
		}

		const createdItems = await Promise.all(
			input.items.map(async (item) => {
				const menuItem = menuItemById.get(item.menu_item_id);
				if (!menuItem) {
					throw new Error("Menu item missing during item insertion");
				}
				const [created] = await tx
					.insert(orderItemsInTapMenu)
					.values({
						order_id: createdOrder.id,
						menu_item_id: menuItem.id,
						quantity: item.quantity,
						notes: item.notes,
						price_at_time: menuItem.price,
					})
					.returning();
				return created;
			}),
		);

		return { order: createdOrder, items: createdItems };
	});
}

export async function listOrders(filter?: {
	tableId?: number;
	status?: string;
}) {
	if (filter?.tableId && filter.status) {
		return await db
			.select()
			.from(ordersInTapMenu)
			.where(
				and(
					eq(ordersInTapMenu.table_id, filter.tableId),
					eq(
						ordersInTapMenu.status,
						filter.status as typeof ordersInTapMenu.$inferSelect.status,
					),
				),
			);
	}

	if (filter?.tableId) {
		return await db
			.select()
			.from(ordersInTapMenu)
			.where(eq(ordersInTapMenu.table_id, filter.tableId));
	}

	if (filter?.status) {
		return await db
			.select()
			.from(ordersInTapMenu)
			.where(
				eq(
					ordersInTapMenu.status,
					filter.status as typeof ordersInTapMenu.$inferSelect.status,
				),
			);
	}

	return await db.select().from(ordersInTapMenu);
}

export async function getOrderById(id: number) {
	const [order] = await db
		.select()
		.from(ordersInTapMenu)
		.where(eq(ordersInTapMenu.id, id))
		.limit(1);
	return order;
}

export async function getOrderByQrCode(qrCode: string) {
	const [order] = await db
		.select()
		.from(ordersInTapMenu)
		.where(eq(ordersInTapMenu.qr_code, qrCode))
		.limit(1);

	if (!order) return undefined;

	const items = await db
		.select()
		.from(orderItemsInTapMenu)
		.where(eq(orderItemsInTapMenu.order_id, order.id));

	return { order, items };
}

export async function updateOrderStatus(id: number, status: string) {
	const [updated] = await db
		.update(ordersInTapMenu)
		.set({ status: status as typeof ordersInTapMenu.$inferSelect.status })
		.where(eq(ordersInTapMenu.id, id))
		.returning();

	return updated;
}

export async function getOrderItems(orderId: number) {
	return await db
		.select()
		.from(orderItemsInTapMenu)
		.where(eq(orderItemsInTapMenu.order_id, orderId));
}
