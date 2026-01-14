CREATE SCHEMA "tap_menu";
--> statement-breakpoint
CREATE TYPE "tap_menu"."order_status" AS ENUM('open', 'preparing', 'ready', 'closed', 'cancelled');--> statement-breakpoint
CREATE TABLE "tap_menu"."menu_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "menu_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tap_menu"."menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"image_url" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tap_menu"."order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"menu_item_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"price_at_time" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tap_menu"."orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_id" integer NOT NULL,
	"qr_code" text NOT NULL,
	"status" "tap_menu"."order_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "orders_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "tap_menu"."tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"qr_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tables_number_unique" UNIQUE("number"),
	CONSTRAINT "tables_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "tap_menu"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "tap_menu"."menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "tap_menu"."menu_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tap_menu"."order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "tap_menu"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tap_menu"."order_items" ADD CONSTRAINT "order_items_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "tap_menu"."menu_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tap_menu"."orders" ADD CONSTRAINT "orders_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "tap_menu"."tables"("id") ON DELETE no action ON UPDATE no action;