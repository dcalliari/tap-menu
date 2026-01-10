import { db } from "@server/db";
import { tablesInTapMenu } from "@server/db/schema";
import { generateQrCode } from "@server/lib/ids";
import { eq } from "drizzle-orm";

export async function listTables() {
	return await db
		.select()
		.from(tablesInTapMenu)
		.orderBy(tablesInTapMenu.number);
}

export async function getTableById(id: number) {
	const [table] = await db
		.select()
		.from(tablesInTapMenu)
		.where(eq(tablesInTapMenu.id, id))
		.limit(1);
	return table;
}

export async function getTableByQrCode(qrCode: string) {
	const [table] = await db
		.select()
		.from(tablesInTapMenu)
		.where(eq(tablesInTapMenu.qr_code, qrCode))
		.limit(1);
	return table;
}

export async function createTable(input: { number: string; qr_code?: string }) {
	const qrCode = input.qr_code?.trim()
		? input.qr_code.trim()
		: generateQrCode("table");

	const [newTable] = await db
		.insert(tablesInTapMenu)
		.values({
			number: input.number,
			qr_code: qrCode,
		})
		.returning();

	return newTable;
}

export async function updateTable(
	id: number,
	input: { number?: string; qr_code?: string },
) {
	const [updatedTable] = await db
		.update(tablesInTapMenu)
		.set({
			number: input.number,
			qr_code: input.qr_code,
		})
		.where(eq(tablesInTapMenu.id, id))
		.returning();

	return updatedTable;
}

export async function deleteTable(id: number) {
	const [deleted] = await db
		.delete(tablesInTapMenu)
		.where(eq(tablesInTapMenu.id, id))
		.returning();

	return deleted;
}
