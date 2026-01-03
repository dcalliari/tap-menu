import type { Context, Next } from "hono";
import { redis } from "./redis";

export function rateLimit({
	limit = 10,
	window = 60,
}: {
	limit?: number;
	window?: number;
}) {
	return async (c: Context, next: Next) => {
		if (process.env.NODE_ENV === "test") {
			await next();
			return;
		}

		const ip =
			c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
		const key = `rate-limit:${ip}`;

		const current = await redis.incr(key);
		if (current === 1) {
			await redis.expire(key, window);
		}

		if (current > limit) {
			return c.json(
				{
					error: "Too Many Requests",
					message: "Rate limit exceeded. Please try again later.",
					success: false,
				},
				{ status: 429 },
			);
		}

		await next();
	};
}
