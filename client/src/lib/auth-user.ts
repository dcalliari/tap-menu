import { AUTH_USER_STORAGE_KEY } from "@/lib/api-config";

export type AuthUser = {
	id: number;
	name: string;
	email: string;
	created_at: string;
};

export function getAuthUser(): AuthUser | null {
	try {
		const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as AuthUser;
	} catch {
		return null;
	}
}

export function setAuthUser(user: AuthUser): void {
	try {
		localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
	} catch {
		// ignore
	}
}

export function clearAuthUser(): void {
	try {
		localStorage.removeItem(AUTH_USER_STORAGE_KEY);
	} catch {
		// ignore
	}
}
