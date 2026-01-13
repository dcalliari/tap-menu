import { expect } from "bun:test";

export async function expectJson<T = unknown>(
	res: Response,
	status: number,
): Promise<T> {
	expect(res.status).toBe(status);
	const text = await res.text();
	let json: unknown;
	try {
		json = text ? JSON.parse(text) : null;
	} catch {
		throw new Error(`Expected JSON response, got: ${text.slice(0, 200)}`);
	}
	return json as T;
}

export function expectHeaderContains(
	res: Response,
	name: string,
	value: string,
) {
	const header = res.headers.get(name);
	expect(header).toBeTruthy();
	expect(header!.toLowerCase()).toContain(value.toLowerCase());
}
