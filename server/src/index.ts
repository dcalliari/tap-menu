import { checkDatabase } from "@server/db";
import { env } from "@server/env";
import { rateLimit } from "@server/lib/rate-limit";
import { checkRedis } from "@server/lib/redis";
import { authRoutes } from "@server/routes/auth";
import { menuRoutes } from "@server/routes/menu";
import { ordersRoutes } from "@server/routes/orders";
import { tablesRoutes } from "@server/routes/tables";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

export const app = new Hono()

	.use(cors(), logger(), rateLimit({ limit: 100 }))

	.route("/auth", authRoutes)
	.route("/tables", tablesRoutes)
	.route("/menu", menuRoutes)
	.route("/orders", ordersRoutes)

	.get("/", (c) => {
		return c.json({
			message: "Tap Menu API is running!",
			version: "1.0.0",
			timestamp: new Date().toISOString(),
			environment: env.NODE_ENV || "development",
		});
	})

	.get("/health", async (c) => {
		const checks = {
			database: await checkDatabase(),
			redis: await checkRedis(),
		};

		const healthy = Object.values(checks).every((status) => status === true);

		return c.json(
			{ ...checks, timestamp: new Date().toISOString() },
			{ status: healthy ? 200 : 503 },
		);
	})

	.onError((err, c) => {
		console.error("API Error:", err);
		const data = {
			error: "Internal Server Error",
			message:
				env.NODE_ENV === "development" ? err.message : "Something went wrong",
			success: false,
		};
		return c.json(data, { status: 500 });
	})

	.notFound((c) => {
		const data = {
			error: "Not Found",
			message: "The requested resource could not be found.",
			success: false,
		};
		return c.json(data, { status: 404 });
	});

export default app;
