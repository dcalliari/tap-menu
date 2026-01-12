import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AuthProvider } from "@/contexts/auth-context";

export const Route = createRootRoute({
	component: () => (
		<AuthProvider>
			<Outlet />
			<TanStackRouterDevtools />
		</AuthProvider>
	),
});
