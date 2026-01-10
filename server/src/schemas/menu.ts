import { z } from "zod";

export const createMenuCategorySchema = z.object({
	name: z.string().trim().min(1),
	description: z.string().trim().min(1).optional(),
});

export const updateMenuCategorySchema = z
	.object({
		name: z.string().trim().min(1).optional(),
		description: z.string().trim().min(1).optional(),
	})
	.refine(
		(value) => value.name !== undefined || value.description !== undefined,
		{
			message: "At least one field must be provided",
		},
	);

export const createMenuItemSchema = z.object({
	category_id: z.number().int().positive().optional(),
	name: z.string().trim().min(1),
	description: z.string().trim().min(1).optional(),
	price: z.number().int().min(0),
	image_url: z.string().trim().min(1).optional(),
	is_available: z.boolean().optional(),
});

export const updateMenuItemSchema = z
	.object({
		category_id: z.number().int().positive().optional(),
		name: z.string().trim().min(1).optional(),
		description: z.string().trim().min(1).optional(),
		price: z.number().int().min(0).optional(),
		image_url: z.string().trim().min(1).optional(),
		is_available: z.boolean().optional(),
	})
	.refine(
		(value) =>
			value.category_id !== undefined ||
			value.name !== undefined ||
			value.description !== undefined ||
			value.price !== undefined ||
			value.image_url !== undefined ||
			value.is_available !== undefined,
		{ message: "At least one field must be provided" },
	);

export const listMenuItemsQuerySchema = z.object({
	categoryId: z.preprocess(
		(value) => {
			if (value === undefined || value === null || value === "") return undefined;
			if (Array.isArray(value)) return value[0];
			return Number(value);
		},
		z.number().int().positive().optional(),
	),
});
