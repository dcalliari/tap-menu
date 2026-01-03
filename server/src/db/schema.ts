import {
	boolean,
	integer,
	pgSchema,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const tap_menu = pgSchema("tap_menu");

export const tables = tap_menu.table("tables", {
	id: serial().primaryKey(),
	number: text().notNull().unique(),
	qr_code: text().notNull().unique(),
	created_at: timestamp({ mode: "string", withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const order_status = tap_menu.enum("order_status", [
	"open",
	"preparing",
	"ready",
	"closed",
	"cancelled",
]);

export const orders = tap_menu.table("orders", {
	id: serial().primaryKey(),
	table_id: integer()
		.references(() => tables.id)
		.notNull(),
	qr_code: text().notNull().unique(),
	status: order_status("status").notNull().default("open"),
	created_at: timestamp({ mode: "string", withTimezone: true })
		.defaultNow()
		.notNull(),
	updated_at: timestamp({ mode: "string", withTimezone: true })
		.defaultNow()
		.notNull(),
	total: integer().notNull().default(0),
});

export const menu_categories = tap_menu.table("menu_categories", {
	id: serial().primaryKey(),
	name: text().notNull().unique(),
	description: text(),
	created_at: timestamp({ mode: "string", withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const menu_items = tap_menu.table("menu_items", {
	id: serial().primaryKey(),
	category_id: integer().references(() => menu_categories.id),
	name: text().notNull(),
	description: text(),
	price: integer().notNull(),
	image_url: text(),
	is_available: boolean().notNull().default(true),
	created_at: timestamp({ mode: "string", withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const order_items = tap_menu.table("order_items", {
	id: serial().primaryKey(),
	order_id: integer()
		.references(() => orders.id)
		.notNull(),
	menu_item_id: integer()
		.references(() => menu_items.id)
		.notNull(),
	quantity: integer().notNull().default(1),
	notes: text(),
	price_at_time: integer().notNull(),
	created_at: timestamp({ mode: "string", withTimezone: true })
		.defaultNow()
		.notNull(),
});
