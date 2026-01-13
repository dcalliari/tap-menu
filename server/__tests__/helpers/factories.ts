import { generateToken } from "@server/lib/auth";

export async function makeAuthHeaders(input?: {
	name?: string;
	email?: string;
}) {
	const secret = process.env.JWT_SECRET;
	if (!secret || secret.length < 32) {
		throw new Error(
			"JWT_SECRET must be set (>= 32 chars). Use `bun run test` (it sets a default).",
		);
	}

	const name = input?.name ?? "Test Admin";
	const email = input?.email ?? `admin_${crypto.randomUUID()}@example.com`;
	const token = await generateToken(name, email, secret);
	return { authorization: `Bearer ${token}` };
}

export function randomEmail() {
	return `user_${crypto.randomUUID()}@example.com`;
}
