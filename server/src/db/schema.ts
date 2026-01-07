import {
	boolean,
	integer,
	pgSchema,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const tapMenu = pgSchema("tap_menu");

export const tablesInTapMenu = tapMenu.table("tables", {
	id: serial().primaryKey(),
	number: text().notNull().unique(),
	qr_code: text().notNull().unique(),
	created_at: timestamp({ mode: "string", withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const orderStatusInTapMenu = tapMenu.enum("order_status", [
	"open",
	"preparing",
	"ready",
	"closed",
	"cancelled",
]);

export const ordersInTapMenu = tapMenu.table("orders", {
	id: serial().primaryKey(),
	table_id: integer()
		.references(() => tablesInTapMenu.id)
		.notNull(),
	qr_code: text().notNull().unique(),
	status: orderStatusInTapMenu("status").notNull().default("open"),
	created_at: timestamp({ mode: "string", withTimezone: true })
		.defaultNow()
		.notNull(),
	updated_at: timestamp({ mode: "string", withTimezone: true })
		.defaultNow()
		.notNull(),
	total: integer().notNull().default(0),
});

export const menuCategoriesInTapMenu = tapMenu.table("menu_categories", {
	id: serial().primaryKey(),
	name: text().notNull().unique(),
	description: text(),
	created_at: timestamp({ mode: "string", withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const menuItemsInTapMenu = tapMenu.table("menu_items", {
	id: serial().primaryKey(),
	category_id: integer().references(() => menuCategoriesInTapMenu.id),
	name: text().notNull(),
	description: text(),
	price: integer().notNull(),
	image_url: text(),
	is_available: boolean().notNull().default(true),
	created_at: timestamp({ mode: "string", withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const orderItemsInTapMenu = tapMenu.table("order_items", {
	id: serial().primaryKey(),
	order_id: integer()
		.references(() => ordersInTapMenu.id)
		.notNull(),
	menu_item_id: integer()
		.references(() => menuItemsInTapMenu.id)
		.notNull(),
	quantity: integer().notNull().default(1),
	notes: text(),
	price_at_time: integer().notNull(),
	created_at: timestamp({ mode: "string", withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const usersInTapMenu = tapMenu.table("users", {
	id: serial().primaryKey(),
	name: text().notNull(),
	email: text().notNull().unique(),
	password_hash: text().notNull(),
	created_at: timestamp({ mode: "string", withTimezone: true })
		.defaultNow()
		.notNull(),
});
