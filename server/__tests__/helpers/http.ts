import type { Hono } from "hono";

export function jsonHeaders(extra?: Record<string, string>) {
	return {
		"content-type": "application/json",
		...(extra ?? {}),
	};
}

export function request(app: Hono, path: string, init?: RequestInit) {
	const url = new URL(path, "http://localhost");
	return app.fetch(new Request(url, init));
}
