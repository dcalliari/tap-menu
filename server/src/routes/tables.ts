import { zValidator } from "@hono/zod-validator";
import { db } from "@server/db";
import { tablesInTapMenu } from "@server/db/schema";
import { createTableSchema, updateTableSchema } from "@server/schemas/tables";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

export const tablesRoutes = new Hono()
	.get("/", async (c) => {
		try {
			const tables = await db
				.select()
				.from(tablesInTapMenu)
				.orderBy(tablesInTapMenu.number);

			return c.json({ success: true, data: tables });
		} catch (error) {
			console.error("Error fetching tables:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})

	.get("/:id", async (c) => {
		try {
			const { id } = c.req.param();

			const [table] = await db
				.select()
				.from(tablesInTapMenu)
				.where(eq(tablesInTapMenu.id, Number(id)))
				.limit(1);

			if (!table) {
				return c.json({ success: false, error: "Table Not Found" }, 404);
			}

			return c.json({ success: true, data: table });
		} catch (error) {
			console.error("Error fetching table:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})

	.post("/", zValidator("json", createTableSchema), async (c) => {
		try {
			const validatedData = c.req.valid("json");

			const [newTable] = await db
				.insert(tablesInTapMenu)
				.values({
					number: validatedData.number,
					qr_code: validatedData.qr_code ? validatedData.qr_code : "",
				})
				.returning();

			return c.json(
				{
					success: true,
					data: newTable,
					message: "Table created successfully",
				},
				{ status: 201 },
			);
		} catch (error) {
			console.error("Error creating table:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})

	.put("/:id", zValidator("json", updateTableSchema), async (c) => {
		try {
			const { id } = c.req.param();
			const validatedData = c.req.valid("json");

			const [updatedTable] = await db
				.update(tablesInTapMenu)
				.set({
					number: validatedData.number,
					qr_code: validatedData.qr_code,
				})
				.where(eq(tablesInTapMenu.id, Number(id)))
				.returning();

			if (!updatedTable) {
				return c.json(
					{ success: false, error: "Table Not Found" },
					{ status: 404 },
				);
			}

			return c.json(
				{
					success: true,
					data: updatedTable,
					message: "Table updated successfully",
				},
				{ status: 200 },
			);
		} catch (error) {
			console.error("Error updating table:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})

	.delete("/:id", async (c) => {
		try {
			const { id } = c.req.param();

			const [deleted] = await db
				.delete(tablesInTapMenu)
				.where(eq(tablesInTapMenu.id, Number(id)))
				.returning();

			if (!deleted) {
				return c.json(
					{ success: false, error: "Table Not Found" },
					{ status: 404 },
				);
			}

			return c.json({
				success: true,
				message: "Table deleted successfully",
				data: deleted,
			});
		} catch (error) {
			console.error("Error deleting table:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	});
