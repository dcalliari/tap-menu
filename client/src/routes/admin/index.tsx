import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

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
import { useMenuCategories, useMenuItems } from "@/hooks/useMenu";
import { useTableQrSvg, useTables } from "@/hooks/useTables";
import { getAuthToken } from "@/lib/auth-token";
import { tablesService } from "@/services";

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
	const queryClient = useQueryClient();

	const [selectedCategoryId, setSelectedCategoryId] = useState<
		string | undefined
	>(undefined);

	const categoriesQuery = useMenuCategories();
	const itemsQuery = useMenuItems(selectedCategoryId);

	const tablesQuery = useTables();
	const [newTableNumber, setNewTableNumber] = useState("");
	const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

	const tableQrQuery = useTableQrSvg(selectedTableId);
	const [tableQrObjectUrl, setTableQrObjectUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!tableQrQuery.data) {
			setTableQrObjectUrl(null);
			return;
		}
		const blob = new Blob([tableQrQuery.data], {
			type: "image/svg+xml;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		setTableQrObjectUrl(url);
		return () => {
			URL.revokeObjectURL(url);
		};
	}, [tableQrQuery.data]);

	const createTableMutation = useMutation({
		mutationFn: async () => {
			const number = newTableNumber.trim();
			if (!number) {
				throw new Error("Table number is required");
			}
			return tablesService.createTable({ number });
		},
		onSuccess: async () => {
			setNewTableNumber("");
			await queryClient.invalidateQueries({ queryKey: ["tables", "list"] });
		},
	});

	const deleteTableMutation = useMutation({
		mutationFn: async (id: number) => tablesService.deleteTable(id),
		onSuccess: async (_res, id) => {
			if (selectedTableId === id) {
				setSelectedTableId(null);
			}
			await queryClient.invalidateQueries({ queryKey: ["tables", "list"] });
		},
	});

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
							<div className="flex flex-col gap-4">
								<div className="grid gap-2">
									<Label htmlFor="new-table-number">Table number</Label>
									<div className="flex gap-2">
										<Input
											id="new-table-number"
											inputMode="numeric"
											value={newTableNumber}
											onChange={(e) => setNewTableNumber(e.target.value)}
											placeholder="e.g. 1"
										/>
										<Button
											disabled={createTableMutation.isPending}
											onClick={() => createTableMutation.mutate()}
										>
											{createTableMutation.isPending ? "Creating…" : "Create"}
										</Button>
									</div>
									{createTableMutation.isError && (
										<p className="text-destructive text-sm">
											{createTableMutation.error instanceof Error
												? createTableMutation.error.message
												: "Failed to create table"}
										</p>
									)}
								</div>

								<div className="flex flex-col gap-2">
									<p className="text-sm font-medium">Existing tables</p>
									{tablesQuery.isLoading && (
										<p className="text-muted-foreground text-sm">Loading…</p>
									)}
									{tablesQuery.isError && (
										<p className="text-destructive text-sm">
											Failed to load tables.
										</p>
									)}
									{tablesQuery.data?.success && (
										<ul className="space-y-2">
											{tablesQuery.data.data.map((table) => (
												<li
													key={table.id}
													className="flex items-center justify-between gap-2"
												>
													<div className="flex min-w-0 flex-col">
														<p className="text-sm font-medium">
															Table {table.number}
														</p>
														<p className="text-muted-foreground text-xs">
															ID: {table.id}
														</p>
													</div>
													<div className="flex items-center gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() => setSelectedTableId(table.id)}
														>
															QR
														</Button>
														<Button
															variant="destructive"
															size="sm"
															disabled={deleteTableMutation.isPending}
															onClick={() =>
																deleteTableMutation.mutate(table.id)
															}
														>
															Delete
														</Button>
													</div>
												</li>
											))}
										</ul>
									)}
									{deleteTableMutation.isError && (
										<p className="text-destructive text-sm">
											{deleteTableMutation.error instanceof Error
												? deleteTableMutation.error.message
												: "Failed to delete table"}
										</p>
									)}
								</div>

								{selectedTableId !== null && (
									<div className="rounded-md border p-3">
										<div className="flex items-center justify-between gap-2">
											<p className="text-sm font-medium">QR preview</p>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setSelectedTableId(null)}
											>
												Close
											</Button>
										</div>
										{tableQrQuery.isLoading && (
											<p className="text-muted-foreground mt-2 text-sm">
												Loading…
											</p>
										)}
										{tableQrQuery.isError && (
											<p className="text-destructive mt-2 text-sm">
												Failed to load QR code.
											</p>
										)}
										{tableQrObjectUrl && (
											<img
												src={tableQrObjectUrl}
												alt={`Table ${selectedTableId} QR`}
												className="mt-2 w-full max-w-56"
											/>
										)}
									</div>
								)}
							</div>
						</CardContent>
						<CardFooter>
							<Button
								variant="outline"
								onClick={() => tablesQuery.refetch()}
								disabled={tablesQuery.isFetching}
							>
								Refresh
							</Button>
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
