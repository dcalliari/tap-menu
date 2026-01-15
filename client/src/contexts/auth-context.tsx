import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";

import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth-token";
import {
	type AuthUser,
	clearAuthUser,
	getAuthUser,
	setAuthUser,
} from "@/lib/auth-user";
import { authService } from "@/services";

type AuthState = {
	token: string | null;
	user: AuthUser | null;
};

type AuthContextValue = {
	state: AuthState;
	isAuthenticated: boolean;
	login: (input: { email: string; password: string }) => Promise<void>;
	register: (input: {
		name: string;
		email: string;
		password: string;
	}) => Promise<void>;
	logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [token, setToken] = useState<string | null>(() => getAuthToken());
	const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());

	const isAuthenticated = Boolean(token);

	const logout = useCallback(() => {
		clearAuthToken();
		clearAuthUser();
		setToken(null);
		setUser(null);
		toast.success("Logged out successfully");
	}, []);

	const login = useCallback(
		async (input: { email: string; password: string }) => {
			const res = await authService.login(input);
			if ("error" in res) {
				throw new Error(res.error ?? "Invalid email or password");
			}
			setAuthToken(res.token);
			setAuthUser(res.user);
			setToken(res.token);
			setUser(res.user);
			toast.success("Logged in successfully");
		},
		[],
	);

	const register = useCallback(
		async (input: { name: string; email: string; password: string }) => {
			const res = await authService.register(input);
			if ("error" in res) {
				throw new Error(res.error ?? "Email already registered");
			}
			// register() may not include id/created_at in return type (server returns minimal user)
			// So we store token only; user can be fetched later if needed.
			setAuthToken(res.token);
			setToken(res.token);
			setUser(null);
			toast.success("Account created successfully");
		},
		[],
	);

	const value = useMemo<AuthContextValue>(
		() => ({
			state: { token, user },
			isAuthenticated,
			login,
			register,
			logout,
		}),
		[isAuthenticated, login, logout, register, token, user],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return ctx;
}
