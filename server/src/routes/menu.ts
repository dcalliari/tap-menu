import { zValidator } from "@hono/zod-validator";
import { authenticateToken } from "@server/lib/auth";
import {
	createMenuCategorySchema,
	createMenuItemSchema,
	listMenuItemsQuerySchema,
	updateMenuCategorySchema,
	updateMenuItemSchema,
} from "@server/schemas/menu";
import {
	createMenuCategory,
	createMenuItem,
	deleteMenuCategory,
	deleteMenuItem,
	getMenuCategoryById,
	getMenuItemById,
	listMenuCategories,
	listMenuItems,
	updateMenuCategory,
	updateMenuItem,
} from "@server/services/menu";
import { Hono } from "hono";

const categoriesRoutes = new Hono()
	.get("/", async (c) => {
		try {
			const categories = await listMenuCategories();
			return c.json({ success: true, data: categories });
		} catch (error) {
			console.error("Error fetching categories:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	.get("/:id", async (c) => {
		try {
			const id = Number(c.req.param("id"));
			const category = await getMenuCategoryById(id);
			if (!category) {
				return c.json(
					{ success: false, error: "Category Not Found" },
					{ status: 404 },
				);
			}
			return c.json({ success: true, data: category });
		} catch (error) {
			console.error("Error fetching category:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	.post(
		"/",
		authenticateToken,
		zValidator("json", createMenuCategorySchema),
		async (c) => {
			try {
				const body = c.req.valid("json");
				const created = await createMenuCategory(body);
				return c.json({ success: true, data: created }, 201);
			} catch (error) {
				console.error("Error creating category:", error);
				return c.json({ error: "Internal Server Error" }, 500);
			}
		},
	)
	.put(
		"/:id",
		authenticateToken,
		zValidator("json", updateMenuCategorySchema),
		async (c) => {
			try {
				const id = Number(c.req.param("id"));
				const body = c.req.valid("json");
				const updated = await updateMenuCategory(id, body);
				if (!updated) {
					return c.json(
						{ success: false, error: "Category Not Found" },
						{ status: 404 },
					);
				}
				return c.json({ success: true, data: updated });
			} catch (error) {
				console.error("Error updating category:", error);
				return c.json({ error: "Internal Server Error" }, 500);
			}
		},
	)
	.delete("/:id", authenticateToken, async (c) => {
		try {
			const id = Number(c.req.param("id"));
			const deleted = await deleteMenuCategory(id);
			if (!deleted) {
				return c.json(
					{ success: false, error: "Category Not Found" },
					{ status: 404 },
				);
			}
			return c.json({ success: true, data: deleted });
		} catch (error) {
			console.error("Error deleting category:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	});

const itemsRoutes = new Hono()
	.get("/", zValidator("query", listMenuItemsQuerySchema), async (c) => {
		try {
			const { categoryId } = c.req.valid("query");
			const items = await listMenuItems({ categoryId });
			return c.json({ success: true, data: items });
		} catch (error) {
			console.error("Error fetching items:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	.get("/:id", async (c) => {
		try {
			const id = Number(c.req.param("id"));
			const item = await getMenuItemById(id);
			if (!item) {
				return c.json(
					{ success: false, error: "Item Not Found" },
					{ status: 404 },
				);
			}
			return c.json({ success: true, data: item });
		} catch (error) {
			console.error("Error fetching item:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	.post(
		"/",
		authenticateToken,
		zValidator("json", createMenuItemSchema),
		async (c) => {
			try {
				const body = c.req.valid("json");
				const created = await createMenuItem(body);
				return c.json({ success: true, data: created }, 201);
			} catch (error) {
				console.error("Error creating item:", error);
				return c.json({ error: "Internal Server Error" }, 500);
			}
		},
	)
	.put(
		"/:id",
		authenticateToken,
		zValidator("json", updateMenuItemSchema),
		async (c) => {
			try {
				const id = Number(c.req.param("id"));
				const body = c.req.valid("json");
				const updated = await updateMenuItem(id, body);
				if (!updated) {
					return c.json(
						{ success: false, error: "Item Not Found" },
						{ status: 404 },
					);
				}
				return c.json({ success: true, data: updated });
			} catch (error) {
				console.error("Error updating item:", error);
				return c.json({ error: "Internal Server Error" }, 500);
			}
		},
	)
	.delete("/:id", authenticateToken, async (c) => {
		try {
			const id = Number(c.req.param("id"));
			const deleted = await deleteMenuItem(id);
			if (!deleted) {
				return c.json(
					{ success: false, error: "Item Not Found" },
					{ status: 404 },
				);
			}
			return c.json({ success: true, data: deleted });
		} catch (error) {
			console.error("Error deleting item:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	});

export const menuRoutes = new Hono()
	.route("/categories", categoriesRoutes)
	.route("/items", itemsRoutes);
