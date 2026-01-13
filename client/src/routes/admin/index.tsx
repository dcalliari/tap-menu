import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
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
import { useAuth } from "@/contexts/auth-context";
import { useMenuCategories, useMenuItems } from "@/hooks/useMenu";
import { getAuthToken } from "@/lib/auth-token";

export const Route = createFileRoute("/admin/")({
	beforeLoad: () => {
		const token = getAuthToken();
		if (!token) {
			throw redirect({ to: "/login" });
		}
	},
	component: AdminManagementPage,
});

function AdminManagementPage() {
	const navigate = useNavigate();
	const auth = useAuth();

	const [selectedCategoryId, setSelectedCategoryId] = useState<
		string | undefined
	>(undefined);

	const categoriesQuery = useMenuCategories();
	const itemsQuery = useMenuItems(selectedCategoryId);

	return (
		<div className="min-h-screen">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
				<header className="flex items-start justify-between gap-4">
					<div className="flex flex-col gap-1">
						<h1 className="text-2xl font-semibold tracking-tight">
							Administration
						</h1>
						<p className="text-muted-foreground text-sm">
							Manage menus, tables, and orders.
						</p>
					</div>
					<div className="flex items-center gap-2">
						{auth.state.user?.email && (
							<p className="text-muted-foreground hidden text-sm sm:block">
								{auth.state.user.email}
							</p>
						)}
						<Button variant="outline" asChild>
							<Link to="/">Back to home</Link>
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								auth.logout();
								void navigate({ to: "/login" });
							}}
						>
							Logout
						</Button>
					</div>
				</header>

				<section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Menu</CardTitle>
							<CardDescription>
								Create and update categories and items.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<p className="text-sm font-medium">Categories</p>
									{categoriesQuery.isLoading && (
										<p className="text-muted-foreground text-sm">Loading…</p>
									)}
									{categoriesQuery.isError && (
										<p className="text-destructive text-sm">
											Failed to load categories.
										</p>
									)}
									{categoriesQuery.data && (
										<div className="flex flex-wrap gap-2">
											{categoriesQuery.data.data.map((category) => (
												<Button
													key={category.id}
													variant={
														selectedCategoryId === String(category.id)
															? "default"
															: "outline"
													}
													size="sm"
													onClick={() =>
														setSelectedCategoryId(String(category.id))
													}
												>
													{category.name}
												</Button>
											))}
										</div>
									)}
								</div>

								<div className="flex flex-col gap-2">
									<p className="text-sm font-medium">Items</p>
									{!selectedCategoryId && (
										<p className="text-muted-foreground text-sm">
											Select a category to view items.
										</p>
									)}
									{itemsQuery.isLoading && selectedCategoryId && (
										<p className="text-muted-foreground text-sm">Loading…</p>
									)}
									{itemsQuery.isError && selectedCategoryId && (
										<p className="text-destructive text-sm">
											Failed to load items.
										</p>
									)}
									{itemsQuery.data && (
										<ul className="space-y-1">
											{itemsQuery.data.data.map((item) => (
												<li
													key={item.id}
													className="flex items-center justify-between gap-4"
												>
													<span className="text-sm">{item.name}</span>
													<span className="text-muted-foreground text-sm">
														{item.price}
													</span>
												</li>
											))}
										</ul>
									)}
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								variant="outline"
								onClick={() => setSelectedCategoryId(undefined)}
								disabled={!selectedCategoryId}
							>
								Clear selection
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Tables</CardTitle>
							<CardDescription>
								Create tables and print QR codes.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">
								Coming next: table setup and QR generation.
							</p>
						</CardContent>
						<CardFooter>
							<Button disabled>Open Table Manager</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Orders</CardTitle>
							<CardDescription>Track and update order status.</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">
								Coming next: active orders dashboard.
							</p>
						</CardContent>
						<CardFooter>
							<Button disabled>Open Orders Dashboard</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>QR Scanner</CardTitle>
							<CardDescription>
								Test QR flows for tables and orders.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">
								Coming next: route wiring for scanned QR codes.
							</p>
						</CardContent>
						<CardFooter>
							<Button disabled>Open QR Tools</Button>
						</CardFooter>
					</Card>
				</section>
			</div>
		</div>
	);
}
