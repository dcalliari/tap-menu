import { apiClient, parseJsonOrThrow } from "@/lib/api-client";

export type LoginInput = { email: string; password: string };
export type RegisterInput = {
	name: string;
	email: string;
	password: string;
};

export async function login(input: LoginInput) {
	const res = await apiClient.auth.login.$post({ json: input });
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function register(input: RegisterInput) {
	const res = await apiClient.auth.register.$post({ json: input });
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}
