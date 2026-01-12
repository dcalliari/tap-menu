import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
	component: AdminManagementPage,
});

function AdminManagementPage() {
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
					<Button variant="outline" asChild>
						<Link to="/">Back to home</Link>
					</Button>
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
							<p className="text-muted-foreground text-sm">
								Coming next: menu CRUD and publishing.
							</p>
						</CardContent>
						<CardFooter>
							<Button disabled>Open Menu Manager</Button>
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
