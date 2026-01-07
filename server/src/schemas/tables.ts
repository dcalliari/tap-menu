import { z } from "zod";

export const createTableSchema = z.object({
	number: z.string().trim().min(1),
	qr_code: z.string().trim().min(1).optional(),
});

export const updateTableSchema = z
	.object({
		number: z.string().trim().min(1).optional(),
		qr_code: z.string().trim().min(1).optional(),
	})
	.refine(
		(value) => value.number !== undefined || value.qr_code !== undefined,
		{
			message: "At least one field must be provided",
		},
	);
