import { db } from "@server/db";
import {
	menuCategoriesInTapMenu,
	menuItemsInTapMenu,
	tablesInTapMenu,
} from "@server/db/schema";
import { generateQrCode } from "@server/lib/ids";

export async function createTableFixture(input?: {
	number?: string;
	qr_code?: string;
}) {
	const number = input?.number ?? String(Math.floor(Math.random() * 1000) + 1);
	const qrCode = input?.qr_code ?? generateQrCode("table");
	const [created] = await db
		.insert(tablesInTapMenu)
		.values({ number, qr_code: qrCode })
		.returning();
	if (!created) throw new Error("Failed to create table fixture");
	return created;
}

export async function createMenuCategoryFixture(input?: {
	name?: string;
	description?: string;
}) {
	const name = input?.name ?? `Category ${crypto.randomUUID()}`;
	const [created] = await db
		.insert(menuCategoriesInTapMenu)
		.values({ name, description: input?.description })
		.returning();
	if (!created) throw new Error("Failed to create category fixture");
	return created;
}

export async function createMenuItemFixture(input: {
	name?: string;
	description?: string;
	price?: number;
	category_id?: number;
	image_url?: string;
	is_available?: boolean;
}) {
	const name = input.name ?? `Item ${crypto.randomUUID()}`;
	const price = input.price ?? 1000;
	const [created] = await db
		.insert(menuItemsInTapMenu)
		.values({
			name,
			description: input.description,
			price,
			category_id: input.category_id,
			image_url: input.image_url,
			is_available: input.is_available,
		})
		.returning();
	if (!created) throw new Error("Failed to create item fixture");
	return created;
}
