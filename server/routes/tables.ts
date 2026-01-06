import { db } from "@server/db";
import { tablesInTapMenu } from "@server/db/schema";
import { Hono } from "hono";
import type { Bindings, Variables } from "hono/types";

export const tableRoutes = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>()

	.get("/", async (c) => {
		try {
			const tables = await db.select().from(tablesInTapMenu);

			return c.json(tables, 200);
		} catch (error) {
			console.error("Error fetching tables:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})

	.post("/", async (c) => {
		try {
			const { number, qr_code } = await c.req.json();

			if (!number || !qr_code) {
				return c.json(
					{ error: "Missing required fields: number and qr_code" },
					400,
				);
			}

			const newTable = await db
				.insert(tablesInTapMenu)
				.values({ number, qr_code })
				.returning();

			return c.json(newTable[0], 201);
		} catch (error) {
			console.error("Error creating table:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	});
