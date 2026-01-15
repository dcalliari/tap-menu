import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
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
import { useMenuCategories, useMenuItems } from "@/hooks/useMenu";
import { cn } from "@/lib/utils";
import { ordersService, tablesService } from "@/services";

export const Route = createFileRoute("/table/$tableQrCode")({
	component: TableMenuPage,
});

type CartLine = {
	menuItemId: number;
	name: string;
	price: number;
	quantity: number;
	notes?: string;
};

function formatCents(value: number) {
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: "USD",
	}).format(value / 100);
}

function TableMenuPage() {
	const navigate = useNavigate();
	const { tableQrCode } = Route.useParams();

	const tableQuery = useQuery({
		queryKey: ["tables", "qr", tableQrCode],
		queryFn: async () => tablesService.getTableByQr(tableQrCode),
	});

	const categoriesQuery = useMenuCategories();
	const [selectedCategoryId, setSelectedCategoryId] = useState<
		string | undefined
	>(undefined);

	useEffect(() => {
		if (selectedCategoryId) return;
		const first = categoriesQuery.data?.data?.[0];
		if (first) {
			setSelectedCategoryId(String(first.id));
		}
	}, [categoriesQuery.data, selectedCategoryId]);

	const itemsQuery = useMenuItems(selectedCategoryId);

	const [cart, setCart] = useState<Record<number, CartLine>>({});
	const [cartOpen, setCartOpen] = useState(false);

	const cartLines = useMemo(() => Object.values(cart), [cart]);
	const cartCount = useMemo(
		() => cartLines.reduce((sum, line) => sum + line.quantity, 0),
		[cartLines],
	);
	const cartTotal = useMemo(
		() => cartLines.reduce((sum, line) => sum + line.price * line.quantity, 0),
		[cartLines],
	);

	const createOrderMutation = useMutation({
		mutationFn: async () => {
			if (cartLines.length === 0) {
				throw new Error("Your cart is empty");
			}

			return ordersService.createOrder({
				table_qr_code: tableQrCode,
				items: cartLines.map((line) => ({
					menu_item_id: line.menuItemId,
					quantity: line.quantity,
					notes: line.notes?.trim() ? line.notes.trim() : undefined,
				})),
			});
		},
		onSuccess: async (res) => {
			setCart({});
			const orderQr = res.data.order.qr_code;
			await navigate({
				to: "/order/$orderQrCode",
				params: { orderQrCode: orderQr },
			});
		},
	});

	const tableLabel = useMemo(() => {
		if (tableQuery.isLoading) return "Loading table…";
		if (tableQuery.data) return `Table ${tableQuery.data.data.number}`;
		return "Table";
	}, [tableQuery.data, tableQuery.isLoading]);

	const cartSummary = useMemo(() => {
		if (cartCount === 0) return "No items yet.";
		return `${cartCount} item${cartCount === 1 ? "" : "s"} • ${formatCents(cartTotal)}`;
	}, [cartCount, cartTotal]);

	function CartPanel(props: { variant: "card" | "drawer" }) {
		return (
			<>
				{props.variant === "card" ? (
					<Card>
						<CardHeader>
							<CardTitle>Cart</CardTitle>
							<CardDescription>{cartSummary}</CardDescription>
						</CardHeader>
						<CardContent>{renderCartBody()}</CardContent>
						<CardFooter className="flex flex-col items-stretch gap-2">
							{renderCartActions()}
						</CardFooter>
					</Card>
				) : (
					<div className="flex h-full flex-col">
						<div className="flex items-start justify-between gap-3 border-b p-4">
							<div className="min-w-0">
								<p className="text-sm font-medium">Cart</p>
								<p className="text-muted-foreground text-xs">{cartSummary}</p>
							</div>
							<Button variant="outline" size="sm" onClick={() => setCartOpen(false)}>
								Close
							</Button>
						</div>
						<div className="flex-1 overflow-auto p-4">{renderCartBody()}</div>
						<div className="border-t p-4">{renderCartActions()}</div>
					</div>
				)}
			</>
		);
	}

	function renderCartActions() {
		return (
			<div className="flex flex-col gap-2">
				<Button
					disabled={cartLines.length === 0 || createOrderMutation.isPending}
					onClick={() => createOrderMutation.mutate()}
				>
					{createOrderMutation.isPending ? "Placing order…" : "Place order"}
				</Button>
				<Button
					variant="outline"
					disabled={cartLines.length === 0}
					onClick={() => setCart({})}
				>
					Clear cart
				</Button>
			</div>
		);
	}

	function renderCartBody() {
		return (
			<>
				{cartLines.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						Add items from the menu to get started.
					</p>
				) : (
					<ul className="space-y-3">
						{cartLines.map((line) => (
							<li
								key={line.menuItemId}
								className="flex items-start justify-between gap-3"
							>
								<div className="min-w-0">
									<p className="truncate text-sm font-medium">{line.name}</p>
									<p className="text-muted-foreground text-xs">
										{formatCents(line.price)} × {line.quantity}
									</p>
									<Input
										value={line.notes ?? ""}
										onChange={(e) => {
											const nextNotes = e.target.value;
											setCart((prev) => {
												const current = prev[line.menuItemId];
												if (!current) return prev;
												return {
													...prev,
													[line.menuItemId]: {
														...current,
														notes: nextNotes,
													},
												};
											});
										}}
										placeholder="Notes (optional)"
										className="mt-2 h-8"
									/>
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setCart((prev) => {
												const current = prev[line.menuItemId];
												if (!current) return prev;
												const nextQty = current.quantity - 1;
												if (nextQty <= 0) {
													const { [line.menuItemId]: _removed, ...rest } = prev;
													return rest;
												}
												return {
													...prev,
													[line.menuItemId]: {
														...current,
														quantity: nextQty,
													},
												};
											});
										}}
									>
										-
									</Button>
									<p className="w-6 text-center text-sm">{line.quantity}</p>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setCart((prev) => {
												const current = prev[line.menuItemId];
												if (!current) return prev;
												return {
													...prev,
													[line.menuItemId]: {
														...current,
														quantity: current.quantity + 1,
													},
												};
										});
										}}
									>
										+
									</Button>
								</div>
							</li>
						))}
					</ul>
				)}

				{createOrderMutation.isError && (
					<p className="text-destructive mt-3 text-sm">
						{createOrderMutation.error instanceof Error
							? createOrderMutation.error.message
							: "Failed to place order"}
					</p>
				)}
			</>
		);
	}

	return (
		<AppShell
			title="Menu"
			description={tableLabel}
			actions={
				<Button variant="outline" asChild>
					<Link to="/admin">Admin</Link>
				</Button>
			}
		>
			{tableQuery.isError && (
				<Card>
					<CardHeader>
						<CardTitle>Table not found</CardTitle>
						<CardDescription>
							This QR code doesn’t match any table.
						</CardDescription>
					</CardHeader>
					<CardFooter>
						<Button variant="outline" asChild>
							<Link to="/">Go back</Link>
						</Button>
					</CardFooter>
				</Card>
			)}

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
				<div className="flex flex-col gap-4">
					<Card>
						<CardHeader>
							<CardTitle>Categories</CardTitle>
							<CardDescription>Pick a category to browse items.</CardDescription>
						</CardHeader>
						<CardContent>
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
											size="sm"
											variant={
												selectedCategoryId === String(category.id)
													? "default"
													: "outline"
											}
											onClick={() => setSelectedCategoryId(String(category.id))}
										>
											{category.name}
										</Button>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
					<CardHeader>
						<CardTitle>Items</CardTitle>
						<CardDescription>
							{selectedCategoryId
								? "Tap an item to add it to your cart."
								: "Select a category."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{!selectedCategoryId && (
							<p className="text-muted-foreground text-sm">
								Choose a category to see items.
							</p>
						)}

						{itemsQuery.isLoading && selectedCategoryId && (
							<p className="text-muted-foreground text-sm">Loading…</p>
						)}
						{itemsQuery.isError && selectedCategoryId && (
							<p className="text-destructive text-sm">Failed to load items.</p>
						)}
						{itemsQuery.data && (
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								{itemsQuery.data.data.map((item) => {
									const cartLine = cart[item.id];
									const qty = cartLine?.quantity ?? 0;
									return (
										<div key={item.id} className="rounded-md border p-3">
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<p className="truncate text-sm font-medium">
														{item.name}
													</p>
													{item.description && (
														<p className="text-muted-foreground mt-1 text-xs">
															{item.description}
														</p>
													)}
												</div>
												<div className="flex shrink-0 flex-col items-end gap-2">
													<p className="text-sm font-medium">
														{formatCents(item.price)}
													</p>
													<Button
														size="sm"
														disabled={!item.is_available}
														onClick={() => {
															setCart((prev) => {
																const existing = prev[item.id];
																const nextQty = (existing?.quantity ?? 0) + 1;
																return {
																	...prev,
																	[item.id]: {
																		menuItemId: item.id,
																		name: item.name,
																		price: item.price,
																		quantity: nextQty,
																	},
																};
															});
														}}
													>
														{item.is_available
															? qty > 0
																? `Add (+${qty})`
																: "Add"
															: "Unavailable"}
													</Button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
						<CardFooter>
						<div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-muted-foreground text-sm">
								Tip: you can place multiple orders.
							</p>
							<div className="flex items-center gap-2">
								<Input
									readOnly
									value={tableQrCode}
									className="hidden w-64 sm:block"
								/>
								<Button
									variant="outline"
									onClick={() => setCart({})}
									disabled={cartLines.length === 0}
								>
									Clear cart
								</Button>
							</div>
						</div>
						</CardFooter>
					</Card>
				</div>

				<div className="hidden lg:block">
					<CartPanel variant="card" />
				</div>
			</div>

			{cartCount > 0 && (
				<div className="lg:hidden">
					<div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
						<div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
							<div className="min-w-0">
								<p className="truncate text-sm font-medium">{cartSummary}</p>
								<p className="text-muted-foreground text-xs">
									Tap to review before placing your order.
								</p>
							</div>
							<Button onClick={() => setCartOpen(true)}>View cart</Button>
						</div>
					</div>
					<div className="h-16" />
				</div>
			)}

			<div
				className={cn(
					"fixed inset-0 z-50 lg:hidden",
					cartOpen ? "" : "pointer-events-none",
				)}
				aria-hidden={!cartOpen}
			>
				<button
					type="button"
					aria-label="Close cart"
					className={cn(
						"absolute inset-0 bg-black/50 transition-opacity",
						cartOpen ? "opacity-100" : "opacity-0",
						cartOpen ? "" : "pointer-events-none",
					)}
					onClick={() => setCartOpen(false)}
				/>
				<div
					className={cn(
						"absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-hidden rounded-t-xl border bg-background shadow-lg transition-transform",
						cartOpen ? "translate-y-0" : "translate-y-full",
					)}
				>
					<CartPanel variant="drawer" />
				</div>
			</div>
		</AppShell>
	);
}
