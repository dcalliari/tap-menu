import { db } from "@server/db";
import { menuCategoriesInTapMenu, menuItemsInTapMenu } from "@server/db/schema";
import { eq } from "drizzle-orm";

export async function listMenuCategories() {
	return await db
		.select()
		.from(menuCategoriesInTapMenu)
		.orderBy(menuCategoriesInTapMenu.name);
}

export async function getMenuCategoryById(id: number) {
	const [category] = await db
		.select()
		.from(menuCategoriesInTapMenu)
		.where(eq(menuCategoriesInTapMenu.id, id))
		.limit(1);
	return category;
}

export async function createMenuCategory(input: {
	name: string;
	description?: string;
}) {
	const [created] = await db
		.insert(menuCategoriesInTapMenu)
		.values({ name: input.name, description: input.description })
		.returning();
	return created;
}

export async function updateMenuCategory(
	id: number,
	input: { name?: string; description?: string },
) {
	const [updated] = await db
		.update(menuCategoriesInTapMenu)
		.set({ name: input.name, description: input.description })
		.where(eq(menuCategoriesInTapMenu.id, id))
		.returning();
	return updated;
}

export async function deleteMenuCategory(id: number) {
	const [deleted] = await db
		.delete(menuCategoriesInTapMenu)
		.where(eq(menuCategoriesInTapMenu.id, id))
		.returning();
	return deleted;
}

export async function listMenuItems(filter?: { categoryId?: number }) {
	if (filter?.categoryId) {
		return await db
			.select()
			.from(menuItemsInTapMenu)
			.where(eq(menuItemsInTapMenu.category_id, filter.categoryId));
	}

	return await db.select().from(menuItemsInTapMenu);
}

export async function getMenuItemById(id: number) {
	const [item] = await db
		.select()
		.from(menuItemsInTapMenu)
		.where(eq(menuItemsInTapMenu.id, id))
		.limit(1);
	return item;
}

export async function createMenuItem(input: {
	category_id?: number;
	name: string;
	description?: string;
	price: number;
	image_url?: string;
	is_available?: boolean;
}) {
	const [created] = await db
		.insert(menuItemsInTapMenu)
		.values({
			category_id: input.category_id,
			name: input.name,
			description: input.description,
			price: input.price,
			image_url: input.image_url,
			is_available: input.is_available,
		})
		.returning();
	return created;
}

export async function updateMenuItem(
	id: number,
	input: {
		category_id?: number;
		name?: string;
		description?: string;
		price?: number;
		image_url?: string;
		is_available?: boolean;
	},
) {
	const [updated] = await db
		.update(menuItemsInTapMenu)
		.set({
			category_id: input.category_id,
			name: input.name,
			description: input.description,
			price: input.price,
			image_url: input.image_url,
			is_available: input.is_available,
		})
		.where(eq(menuItemsInTapMenu.id, id))
		.returning();
	return updated;
}

export async function deleteMenuItem(id: number) {
	const [deleted] = await db
		.delete(menuItemsInTapMenu)
		.where(eq(menuItemsInTapMenu.id, id))
		.returning();
	return deleted;
}
