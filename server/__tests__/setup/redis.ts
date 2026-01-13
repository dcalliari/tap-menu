export async function flushRedis() {
	try {
		const { redis } = await import("@server/lib/redis");
		await redis.flushall();
	} catch {
		// Redis is optional for most tests; don't fail the suite if it's unavailable.
	}
}

export async function disconnectRedis() {
	try {
		const { redis } = await import("@server/lib/redis");
		await redis.quit();
	} catch {
		// ignore
	}
}
