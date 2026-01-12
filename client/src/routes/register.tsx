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

export const Route = createFileRoute("/register")({
	component: RegisterPage,
});

function RegisterPage() {
	const navigate = useNavigate();
	const auth = useAuth();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	const registerMutation = useMutation({
		mutationFn: async () => {
			setError(null);
			await auth.register({ name, email, password });
		},
		onSuccess: async () => {
			await navigate({ to: "/admin" });
		},
		onError: (err) => {
			setError(err instanceof Error ? err.message : "Registration failed");
		},
	});

	return (
		<div className="min-h-screen">
			<div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-12">
				<header className="flex items-center justify-between">
					<h1 className="text-xl font-semibold tracking-tight">Register</h1>
					<Button variant="outline" asChild>
						<Link to="/">Home</Link>
					</Button>
				</header>

				<Card>
					<CardHeader>
						<CardTitle>Create your admin account</CardTitle>
						<CardDescription>
							Once registered, you can manage tables and orders.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								autoComplete="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Your name"
							/>
						</div>
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
								autoComplete="new-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						{error && <p className="text-destructive text-sm">{error}</p>}
					</CardContent>
					<CardFooter className="flex flex-col gap-3">
						<Button
							className="w-full"
							disabled={registerMutation.isPending}
							onClick={() => registerMutation.mutate()}
						>
							{registerMutation.isPending ? "Creating…" : "Create account"}
						</Button>
						<p className="text-muted-foreground text-sm">
							Already have an account? <Link to="/login">Sign in</Link>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
