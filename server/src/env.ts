import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z
		.string()
		.transform(Number)
		.pipe(z.number().int().positive())
		.default(3000),
	DATABASE_URL: z
		.url("Invalid database URL")
		.default(
			"postgresql://tap_menu_user:tap_menu_pass@localhost:5432/tap_menu_db",
		),
	TEST_DATABASE_URL: z
		.url("Invalid test database URL")
		.default(
			"postgresql://tap_menu_user:tap_menu_pass@localhost:5432/tap_menu_db_test",
		),
	FRONTEND_URL: z.url("Invalid frontend URL").default("http://localhost:5173"),
	REDIS_URL: z.string().default("redis://localhost:6379"),
	JWT_SECRET: z
		.string()
		.min(32, "JWT secret must be at least 32 characters long"),
});

export type Env = z.infer<typeof envSchema>;

const envSource = typeof Bun !== "undefined" ? Bun.env : process.env;
export const env = envSchema.parse(envSource);

export { envSchema };
