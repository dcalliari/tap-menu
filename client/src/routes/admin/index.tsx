import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useMenuCategories, useMenuItems } from "@/hooks/useMenu";
import { useOrders } from "@/hooks/useOrders";
import { useTableQrSvg, useTables } from "@/hooks/useTables";
import { getAuthToken } from "@/lib/auth-token";
import { menuService, ordersService, tablesService } from "@/services";
import type { OrderStatus } from "@/services/orders.service";

function formatCents(value: number) {
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: "USD",
	}).format(value / 100);
}

function parsePriceToCents(price: string) {
	const trimmed = price.trim();
	if (!trimmed) {
		throw new Error("Price is required");
	}

	const numeric = Number(trimmed);
	if (!Number.isFinite(numeric) || numeric < 0) {
		throw new Error("Price must be a valid number");
	}

	return Math.round(numeric * 100);
}

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

	const selectedCategoryNumber = useMemo(() => {
		if (!selectedCategoryId) return null;
		const n = Number(selectedCategoryId);
		return Number.isFinite(n) ? n : null;
	}, [selectedCategoryId]);

	const [newCategoryName, setNewCategoryName] = useState("");
	const [newCategoryDescription, setNewCategoryDescription] = useState("");

	const createCategoryMutation = useMutation({
		mutationFn: async () => {
			const name = newCategoryName.trim();
			const description = newCategoryDescription.trim();
			if (!name) {
				throw new Error("Category name is required");
			}
			return menuService.createMenuCategory({
				name,
				description: description ? description : undefined,
			});
		},
		onSuccess: async (res) => {
			setNewCategoryName("");
			setNewCategoryDescription("");
			if (res.data) {
				setSelectedCategoryId(String(res.data.id));
			}
			await queryClient.invalidateQueries({ queryKey: ["menu", "categories"] });
			toast.success("Category created successfully");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Failed to create category");
		},
	});

	const deleteSelectedCategoryMutation = useMutation({
		mutationFn: async () => {
			if (!selectedCategoryNumber) {
				throw new Error("Select a category to delete");
			}
			return menuService.deleteMenuCategory(selectedCategoryNumber);
		},
		onSuccess: async () => {
			setSelectedCategoryId(undefined);
			await queryClient.invalidateQueries({ queryKey: ["menu", "categories"] });
			await queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
			toast.success("Category deleted successfully");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Failed to delete category");
		},
	});

	const [newItemName, setNewItemName] = useState("");
	const [newItemDescription, setNewItemDescription] = useState("");
	const [newItemPrice, setNewItemPrice] = useState("");
	const [newItemImageUrl, setNewItemImageUrl] = useState("");

	const createItemMutation = useMutation({
		mutationFn: async () => {
			if (!selectedCategoryNumber) {
				throw new Error("Select a category first");
			}

			const name = newItemName.trim();
			const description = newItemDescription.trim();
			const imageUrl = newItemImageUrl.trim();
			if (!name) {
				throw new Error("Item name is required");
			}

			return menuService.createMenuItem({
				category_id: selectedCategoryNumber,
				name,
				description: description ? description : undefined,
				price: parsePriceToCents(newItemPrice),
				image_url: imageUrl ? imageUrl : undefined,
				is_available: true,
			});
		},
		onSuccess: async () => {
			setNewItemName("");
			setNewItemDescription("");
			setNewItemPrice("");
			setNewItemImageUrl("");
			await queryClient.invalidateQueries({
				queryKey: ["menu", "items", selectedCategoryId],
			});
			toast.success("Menu item created successfully");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Failed to create menu item");
		},
	});

	const deleteItemMutation = useMutation({
		mutationFn: async (id: number) => menuService.deleteMenuItem(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["menu", "items", selectedCategoryId],
			});
			toast.success("Menu item deleted successfully");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Failed to delete menu item");
		},
	});

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
			toast.success("Table created successfully");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Failed to create table");
		},
	});

	const deleteTableMutation = useMutation({
		mutationFn: async (id: number) => tablesService.deleteTable(id),
		onSuccess: async (_res, id) => {
			if (selectedTableId === id) {
				setSelectedTableId(null);
			}
			await queryClient.invalidateQueries({ queryKey: ["tables", "list"] });
			toast.success("Table deleted successfully");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Failed to delete table");
		},
	});

	const [ordersStatusFilter, setOrdersStatusFilter] = useState<
		OrderStatus | "all"
	>("open");
	const ordersQuery = useOrders({
		status: ordersStatusFilter === "all" ? undefined : ordersStatusFilter,
	});

	const updateOrderStatusMutation = useMutation({
		mutationFn: async (input: { id: number; status: OrderStatus }) =>
			ordersService.updateOrderStatus(input.id, input.status),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
			toast.success("Order status updated");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Failed to update order status");
		},
	});

	return (
		<AppShell
			title="Administration"
			description="Manage menus, tables, and orders."
			maxWidth="5xl"
			actions={
				<>
					{auth.state.user?.email && (
						<p className="text-muted-foreground hidden text-sm sm:block">
							{auth.state.user.email}
						</p>
					)}
					<Button variant="outline" asChild>
						<Link to="/kitchen">Kitchen</Link>
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
				</>
			}
		>
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
								<div className="grid gap-2 rounded-md border p-3">
									<Label htmlFor="new-category-name">New category</Label>
									<div className="flex gap-2">
										<Input
											id="new-category-name"
											value={newCategoryName}
											onChange={(e) => setNewCategoryName(e.target.value)}
											placeholder="e.g. Starters"
										/>
										<Button
											disabled={createCategoryMutation.isPending}
											onClick={() => createCategoryMutation.mutate()}
										>
											{createCategoryMutation.isPending ? "Adding…" : "Add"}
										</Button>
									</div>
									<Input
										value={newCategoryDescription}
										onChange={(e) => setNewCategoryDescription(e.target.value)}
										placeholder="Description (optional)"
									/>
									{createCategoryMutation.isError && (
										<p className="text-destructive text-sm">
											{createCategoryMutation.error instanceof Error
												? createCategoryMutation.error.message
												: "Failed to create category"}
										</p>
									)}
								</div>
								{categoriesQuery.isLoading && (
									<div className="flex flex-wrap gap-2">
										<Skeleton className="h-8 w-20" />
										<Skeleton className="h-8 w-24" />
										<Skeleton className="h-8 w-16" />
									</div>
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
								{selectedCategoryId && (
									<div className="flex flex-wrap items-center gap-2">
										<Button
											variant="outline"
											onClick={() => setSelectedCategoryId(undefined)}
										>
											Clear selection
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="destructive"
													disabled={deleteSelectedCategoryMutation.isPending}
												>
													{deleteSelectedCategoryMutation.isPending
														? "Deleting…"
														: "Delete selected"}
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Delete Category</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to delete this category? This action cannot be undone. Items in this category will not be deleted automatically.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => deleteSelectedCategoryMutation.mutate()}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								)}
								{deleteSelectedCategoryMutation.isError && (
									<p className="text-destructive text-sm">
										{deleteSelectedCategoryMutation.error instanceof Error
											? deleteSelectedCategoryMutation.error.message
											: "Failed to delete category"}
									</p>
								)}
							</div>

							<div className="flex flex-col gap-2">
								<p className="text-sm font-medium">Items</p>
								{!selectedCategoryId && (
									<p className="text-muted-foreground text-sm">
										Select a category to view and create items.
									</p>
								)}
								{selectedCategoryId && (
									<div className="grid gap-2 rounded-md border p-3">
										<Label htmlFor="new-item-name">New item</Label>
										<Input
											id="new-item-name"
											value={newItemName}
											onChange={(e) => setNewItemName(e.target.value)}
											placeholder="e.g. Fries"
										/>
										<Input
											value={newItemDescription}
											onChange={(e) => setNewItemDescription(e.target.value)}
											placeholder="Description (optional)"
										/>
										<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
											<Input
												type="number"
												inputMode="decimal"
												step="0.01"
												value={newItemPrice}
												onChange={(e) => setNewItemPrice(e.target.value)}
												placeholder="Price (e.g. 9.99)"
											/>
											<Input
												value={newItemImageUrl}
												onChange={(e) => setNewItemImageUrl(e.target.value)}
												placeholder="Image URL (optional)"
											/>
										</div>
										<Button
											disabled={createItemMutation.isPending}
											onClick={() => createItemMutation.mutate()}
										>
											{createItemMutation.isPending ? "Adding…" : "Add item"}
										</Button>
										{createItemMutation.isError && (
											<p className="text-destructive text-sm">
												{createItemMutation.error instanceof Error
													? createItemMutation.error.message
													: "Failed to create item"}
											</p>
										)}
									</div>
								)}
								{itemsQuery.isLoading && selectedCategoryId && (
									<div className="space-y-2">
										<Skeleton className="h-12 w-full" />
										<Skeleton className="h-12 w-full" />
										<Skeleton className="h-12 w-full" />
									</div>
								)}
								{itemsQuery.isError && selectedCategoryId && (
									<p className="text-destructive text-sm">
										Failed to load items.
									</p>
								)}
								{itemsQuery.data && (
									<ul className="space-y-2">
										{itemsQuery.data.data.map((item) => (
											<li
												key={item.id}
												className="flex items-start justify-between gap-4 rounded-md border p-3"
											>
												<div className="min-w-0">
													<p className="truncate text-sm font-medium">
														{item.name}
													</p>
													<p className="text-muted-foreground text-xs">
														{formatCents(item.price)}
														{item.is_available ? "" : " • Unavailable"}
													</p>
												</div>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="destructive"
															size="sm"
															disabled={deleteItemMutation.isPending}
														>
															Delete
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete "{item.name}"? This action cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => deleteItemMutation.mutate(item.id)}
																className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
															>
																Delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</li>
										))}
									</ul>
								)}
								{deleteItemMutation.isError && (
									<p className="text-destructive text-sm">
										{deleteItemMutation.error instanceof Error
											? deleteItemMutation.error.message
											: "Failed to delete item"}
									</p>
								)}
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							onClick={() => {
								void categoriesQuery.refetch();
								if (selectedCategoryId) {
									void itemsQuery.refetch();
								}
							}}
							disabled={categoriesQuery.isFetching || itemsQuery.isFetching}
						>
							Refresh menu
						</Button>
					</CardFooter>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Tables</CardTitle>
						<CardDescription>Create tables and print QR codes.</CardDescription>
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
									<div className="space-y-2">
										<Skeleton className="h-10 w-full" />
										<Skeleton className="h-10 w-full" />
									</div>
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
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button
																variant="destructive"
																size="sm"
																disabled={deleteTableMutation.isPending}
															>
																Delete
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>Delete Table</AlertDialogTitle>
																<AlertDialogDescription>
																	Are you sure you want to delete Table {table.number}? This action cannot be undone.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Cancel</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => deleteTableMutation.mutate(table.id)}
																	className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
																>
																	Delete
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
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
										<Skeleton className="mt-2 h-56 w-56" />
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
						<div className="flex flex-col gap-4">
							<div className="flex flex-wrap items-center gap-2">
								<Button
									variant={
										ordersStatusFilter === "open" ? "default" : "outline"
									}
									size="sm"
									onClick={() => setOrdersStatusFilter("open")}
								>
									Open
								</Button>
								<Button
									variant={
										ordersStatusFilter === "preparing" ? "default" : "outline"
									}
									size="sm"
									onClick={() => setOrdersStatusFilter("preparing")}
								>
									Preparing
								</Button>
								<Button
									variant={
										ordersStatusFilter === "ready" ? "default" : "outline"
									}
									size="sm"
									onClick={() => setOrdersStatusFilter("ready")}
								>
									Ready
								</Button>
								<Button
									variant={
										ordersStatusFilter === "closed" ? "default" : "outline"
									}
									size="sm"
									onClick={() => setOrdersStatusFilter("closed")}
								>
									Closed
								</Button>
								<Button
									variant={
										ordersStatusFilter === "cancelled" ? "default" : "outline"
									}
									size="sm"
									onClick={() => setOrdersStatusFilter("cancelled")}
								>
									Cancelled
								</Button>
								<Button
									variant={ordersStatusFilter === "all" ? "default" : "outline"}
									size="sm"
									onClick={() => setOrdersStatusFilter("all")}
								>
									All
								</Button>
							</div>

							{ordersQuery.isLoading && (
								<div className="space-y-2">
									<Skeleton className="h-16 w-full" />
									<Skeleton className="h-16 w-full" />
									<Skeleton className="h-16 w-full" />
								</div>
							)}
							{ordersQuery.isError && (
								<p className="text-destructive text-sm">
									Failed to load orders.
								</p>
							)}
							{ordersQuery.data && (
								<ul className="space-y-2">
									{ordersQuery.data.data.map((order) => (
										<li key={order.id} className="rounded-md border p-3">
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<p className="text-sm font-medium">
														Order #{order.id} • Table {order.table_id}
													</p>
													<p className="text-muted-foreground text-xs">
														Status: {order.status} • Total: {order.total}
													</p>
												</div>
												<div className="flex flex-wrap justify-end gap-2">
													<Button
														variant="outline"
														size="sm"
														disabled={updateOrderStatusMutation.isPending}
														onClick={() =>
															updateOrderStatusMutation.mutate({
																id: order.id,
																status: "preparing",
															})
														}
													>
														Preparing
													</Button>
													<Button
														variant="outline"
														size="sm"
														disabled={updateOrderStatusMutation.isPending}
														onClick={() =>
															updateOrderStatusMutation.mutate({
																id: order.id,
																status: "ready",
															})
														}
													>
														Ready
													</Button>
													<Button
														variant="outline"
														size="sm"
														disabled={updateOrderStatusMutation.isPending}
														onClick={() =>
															updateOrderStatusMutation.mutate({
																id: order.id,
																status: "closed",
															})
														}
													>
														Close
													</Button>
													<Button
														variant="destructive"
														size="sm"
														disabled={updateOrderStatusMutation.isPending}
														onClick={() =>
															updateOrderStatusMutation.mutate({
																id: order.id,
																status: "cancelled",
															})
														}
													>
														Cancel
													</Button>
												</div>
											</div>
										</li>
									))}
								</ul>
							)}

							{updateOrderStatusMutation.isError && (
								<p className="text-destructive text-sm">
									{updateOrderStatusMutation.error instanceof Error
										? updateOrderStatusMutation.error.message
										: "Failed to update order status"}
								</p>
							)}
						</div>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							onClick={() => ordersQuery.refetch()}
							disabled={ordersQuery.isFetching}
						>
							Refresh
						</Button>
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
		</AppShell>
	);
}
