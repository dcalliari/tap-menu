import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const auth = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	const loginMutation = useMutation({
		mutationFn: async () => {
			setError(null);
			await auth.login({ email, password });
		},
		onSuccess: async () => {
			await navigate({ to: "/admin" });
		},
		onError: (err) => {
			setError(err instanceof Error ? err.message : "Login failed");
		},
	});

	return (
		<div className="min-h-screen">
			<div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-12">
				<header className="flex items-center justify-between">
					<h1 className="text-xl font-semibold tracking-tight">Login</h1>
					<Button variant="outline" asChild>
						<Link to="/">Home</Link>
					</Button>
				</header>

				<Card>
					<CardHeader>
						<CardTitle>Welcome back</CardTitle>
						<CardDescription>
							Sign in to manage tables and orders.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								autoComplete="current-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						{error && <p className="text-destructive text-sm">{error}</p>}
					</CardContent>
					<CardFooter className="flex flex-col gap-3">
						<Button
							className="w-full"
							disabled={loginMutation.isPending}
							onClick={() => loginMutation.mutate()}
						>
							{loginMutation.isPending ? "Signing in…" : "Sign in"}
						</Button>
						<p className="text-muted-foreground text-sm">
							No account? <Link to="/register">Create one</Link>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
