import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/api-config";

export function getAuthToken(): string | null {
	try {
		return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
	} catch {
		return null;
	}
}

export function setAuthToken(token: string): void {
	try {
		localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
	} catch {
		// ignore
	}
}

export function clearAuthToken(): void {
	try {
		localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
	} catch {
		// ignore
	}
}
