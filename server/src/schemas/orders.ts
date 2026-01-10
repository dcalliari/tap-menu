import { z } from "zod";

export const createOrderSchema = z.object({
	table_qr_code: z.string().trim().min(1),
	items: z
		.array(
			z.object({
				menu_item_id: z.number().int().positive(),
				quantity: z.number().int().min(1),
				notes: z.string().trim().min(1).optional(),
			}),
		)
		.min(1),
});

export const updateOrderStatusSchema = z.object({
	status: z.enum(["open", "preparing", "ready", "closed", "cancelled"]),
});

export const listOrdersQuerySchema = z.object({
	tableId: z.preprocess(
		(value) => {
			if (value === undefined || value === null || value === "") return undefined;
			if (Array.isArray(value)) return value[0];
			return Number(value);
		},
		z.number().int().positive().optional(),
	),
	status: z
		.enum(["open", "preparing", "ready", "closed", "cancelled"])
		.optional(),
});
