import { hcWithType } from "server/dist/client";

import { API_BASE_URL } from "@/lib/api-config";
import { getAuthToken } from "@/lib/auth-token";

export type ApiError = {
	status: number;
	message: string;
	data?: unknown;
};

export class ApiRequestError extends Error {
	readonly status: number;
	readonly data?: unknown;

	constructor(error: ApiError) {
		super(error.message);
		this.name = "ApiRequestError";
		this.status = error.status;
		this.data = error.data;
	}
}

export const apiClient = hcWithType(API_BASE_URL, {
	headers: async () => {
		const token = getAuthToken();
		const headers: Record<string, string> = {};
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}
		return headers;
	},
});

function getStringField(
	body: unknown,
	key: "error" | "message",
): string | undefined {
	if (!body || typeof body !== "object") {
		return undefined;
	}

	const value = (body as Record<string, unknown>)[key];
	return typeof value === "string" ? value : undefined;
}

export async function parseJsonOrThrow<T>(res: Response): Promise<T> {
	let body: unknown;
	try {
		body = await res.json();
	} catch {
		body = undefined;
	}

	if (!res.ok) {
		const message =
			getStringField(body, "error") ||
			getStringField(body, "message") ||
			res.statusText ||
			"Request failed";

		throw new ApiRequestError({ status: res.status, message, data: body });
	}

	return body as T;
}
