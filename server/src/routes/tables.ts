import { zValidator } from "@hono/zod-validator";
import { authenticateToken } from "@server/lib/auth";
import { buildTableQrUrl, toQrSvg } from "@server/lib/qr";
import { createTableSchema, updateTableSchema } from "@server/schemas/tables";
import {
	createTable,
	deleteTable,
	getTableById,
	listTables,
	updateTable,
} from "@server/services/tables";
import { Hono } from "hono";

export const tablesRoutes = new Hono()
	.get("/", authenticateToken, async (c) => {
		try {
			const tables = await listTables();

			return c.json({ success: true, data: tables });
		} catch (error) {
			console.error("Error fetching tables:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})

	.get("/:id/qr.svg", authenticateToken, async (c) => {
		try {
			const { id } = c.req.param();
			const table = await getTableById(Number(id));

			if (!table) {
				return c.json({ success: false, error: "Table Not Found" }, 404);
			}

			const svg = await toQrSvg(buildTableQrUrl(table.qr_code));
			c.header("Content-Type", "image/svg+xml; charset=utf-8");
			c.header("Cache-Control", "no-store");
			return c.body(svg);
		} catch (error) {
			console.error("Error generating table qr:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})

	.get("/:id", authenticateToken, async (c) => {
		try {
			const { id } = c.req.param();
			const table = await getTableById(Number(id));

			if (!table) {
				return c.json({ success: false, error: "Table Not Found" }, 404);
			}

			return c.json({ success: true, data: table });
		} catch (error) {
			console.error("Error fetching table:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})

	.post(
		"/",
		authenticateToken,
		zValidator("json", createTableSchema),
		async (c) => {
			try {
				const validatedData = c.req.valid("json");
				const newTable = await createTable(validatedData);

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
		},
	)

	.put(
		"/:id",
		authenticateToken,
		zValidator("json", updateTableSchema),
		async (c) => {
			try {
				const { id } = c.req.param();
				const validatedData = c.req.valid("json");
				const updatedTable = await updateTable(Number(id), validatedData);

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
		},
	)

	.delete("/:id", authenticateToken, async (c) => {
		try {
			const { id } = c.req.param();
			const deleted = await deleteTable(Number(id));

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
