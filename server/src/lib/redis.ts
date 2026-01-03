import { env } from "@server/env";
import Redis from "ioredis";

const redis = new Redis(env.REDIS_URL, {
	maxRetriesPerRequest: 3,
	retryStrategy: (times) => {
		if (times > 3) {
			console.error("Redis connection failed after 3 retries");
			return null;
		}
		const delay = Math.min(times * 50, 2000);
		return delay;
	},
	lazyConnect: true,
});

redis.on("error", (err) => {
	console.error("Redis error:", err);
});

redis.on("connect", () => {
	console.log("Redis connected successfully");
});

redis.connect().catch((err) => {
	console.error("Failed to connect to Redis:", err);
});

export { redis };

export const CACHE_KEYS = {
	EVENTS_LIST: "events:list",
	EVENT_DETAIL: (id: string) => `event:${id}`,
	EVENTS_SEARCH: (query: string) => `events:search:${query.toLowerCase()}`,
	MY_EVENTS_SEARCH: (userId: string, query: string) =>
		`events:my:${userId}:search:${query.toLowerCase()}`,
	TICKETS_SEARCH: (userId: string, query: string) =>
		`tickets:${userId}:search:${query.toLowerCase()}`,
	MY_EVENTS_LIST: (userId: string) => `events:my:${userId}:list`,
	MY_TICKETS_LIST: (userId: string) => `tickets:my:${userId}:list`,
	EVENT_TICKETS_LIST: (eventId: string) => `event:${eventId}:tickets:list`,
} as const;

export const CACHE_TTL = {
	EVENTS_LIST: 60,
	EVENT_DETAIL: 300,
	SEARCH: 30,
	MY_EVENTS_LIST: 60,
	MY_TICKETS_LIST: 60,
	EVENT_TICKETS_LIST: 60,
} as const;

export async function getCachedData<T>(key: string): Promise<T | null> {
	try {
		const data = await redis.get(key);
		return data ? JSON.parse(data) : null;
	} catch (error) {
		console.error("Redis get error:", error);
		return null;
	}
}

export async function setCachedData(
	key: string,
	data: unknown,
	ttl: number,
): Promise<void> {
	try {
		await redis.setex(key, ttl, JSON.stringify(data));
	} catch (error) {
		console.error("Redis set error:", error);
	}
}

export async function invalidateCache(pattern: string): Promise<void> {
	try {
		const keys = await redis.keys(pattern);
		if (keys.length > 0) {
			await redis.del(...keys);
		}
	} catch (error) {
		console.error("Redis invalidate error:", error);
	}
}

export async function checkRedis(): Promise<boolean> {
	try {
		await redis.ping();
		return true;
	} catch (error) {
		console.error("Redis health check failed:", error);
		return false;
	}
}
