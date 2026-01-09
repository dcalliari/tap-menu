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
