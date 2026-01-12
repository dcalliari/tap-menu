export const API_BASE_URL =
	import.meta.env.VITE_SERVER_URL?.toString() || "http://localhost:3000";

export const AUTH_TOKEN_STORAGE_KEY = "tap-menu:authToken";

export const AUTH_USER_STORAGE_KEY = "tap-menu:authUser";
