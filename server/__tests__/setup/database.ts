import { Pool } from "pg";

const DEFAULT_TEST_DB_URL =
	"postgresql://tap_menu_user:tap_menu_pass@localhost:5432/tap_menu_db_test";

function getTestDatabaseUrl() {
	return process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DB_URL;
}

let adminPool: Pool | undefined;
let testPool: Pool | undefined;

function getAdminPool(): Pool {
	if (adminPool) return adminPool;
	const url = new URL(getTestDatabaseUrl());
	// Use a maintenance DB to create the actual test DB if needed.
	url.pathname = "/postgres";
	adminPool = new Pool({ connectionString: url.toString() });
	return adminPool;
}

function getTestPool(): Pool {
	if (testPool) return testPool;
	testPool = new Pool({ connectionString: getTestDatabaseUrl() });
	return testPool;
}

export async function ensureTestDatabase() {
	const testUrl = new URL(getTestDatabaseUrl());
	const dbName = testUrl.pathname.replace(/^\//, "");
	if (!dbName) throw new Error("Invalid TEST_DATABASE_URL (missing db name)");

	const pool = getAdminPool();
	const exists = await pool.query(
		"SELECT 1 FROM pg_database WHERE datname = $1",
		[dbName],
	);
	if (exists.rowCount === 0) {
		const safe = `"${dbName.replaceAll('"', '""')}"`;
		await pool.query(`CREATE DATABASE ${safe}`);
	}
}

export async function resetDatabaseSchema() {
	const pool = getTestPool();
	// Recreate everything from scratch for deterministic tests.
	await pool.query(`
		DROP SCHEMA IF EXISTS tap_menu CASCADE;
		CREATE SCHEMA tap_menu;

		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'order_status' AND n.nspname = 'tap_menu') THEN
				CREATE TYPE tap_menu.order_status AS ENUM ('open','preparing','ready','closed','cancelled');
			END IF;
		END
		$$;

		CREATE TABLE tap_menu.tables (
			id SERIAL PRIMARY KEY,
			number TEXT NOT NULL UNIQUE,
			qr_code TEXT NOT NULL UNIQUE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);

		CREATE TABLE tap_menu.orders (
			id SERIAL PRIMARY KEY,
			table_id INTEGER NOT NULL REFERENCES tap_menu.tables(id),
			qr_code TEXT NOT NULL UNIQUE,
			status tap_menu.order_status NOT NULL DEFAULT 'open',
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			total INTEGER NOT NULL DEFAULT 0
		);

		CREATE TABLE tap_menu.menu_categories (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL UNIQUE,
			description TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);

		CREATE TABLE tap_menu.menu_items (
			id SERIAL PRIMARY KEY,
			category_id INTEGER REFERENCES tap_menu.menu_categories(id),
			name TEXT NOT NULL,
			description TEXT,
			price INTEGER NOT NULL,
			image_url TEXT,
			is_available BOOLEAN NOT NULL DEFAULT true,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);

		CREATE TABLE tap_menu.order_items (
			id SERIAL PRIMARY KEY,
			order_id INTEGER NOT NULL REFERENCES tap_menu.orders(id),
			menu_item_id INTEGER NOT NULL REFERENCES tap_menu.menu_items(id),
			quantity INTEGER NOT NULL DEFAULT 1,
			notes TEXT,
			price_at_time INTEGER NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);

		CREATE TABLE tap_menu.users (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);
	`);
}

export async function truncateAllTables() {
	const pool = getTestPool();
	await pool.query(`
		TRUNCATE TABLE
			tap_menu.order_items,
			tap_menu.orders,
			tap_menu.menu_items,
			tap_menu.menu_categories,
			tap_menu.tables,
			tap_menu.users
		RESTART IDENTITY CASCADE;
	`);
}

export async function closeTestPools() {
	await testPool?.end().catch(() => undefined);
	await adminPool?.end().catch(() => undefined);
	testPool = undefined;
	adminPool = undefined;
}
