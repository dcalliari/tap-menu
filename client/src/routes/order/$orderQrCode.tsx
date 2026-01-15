import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

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
import { useAllMenuItems } from "@/hooks/useMenu";
import { ordersService } from "@/services";

export const Route = createFileRoute("/order/$orderQrCode")({
	component: OrderStatusPage,
});

function formatCents(value: number) {
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: "USD",
	}).format(value / 100);
}

function OrderStatusPage() {
	const { orderQrCode } = Route.useParams();

	const menuItemsQuery = useAllMenuItems();
	const menuItemNameById = useMemo(() => {
		const items = menuItemsQuery.data?.data ?? [];
		return new Map(items.map((mi) => [mi.id, mi.name] as const));
	}, [menuItemsQuery.data]);

	const orderQuery = useQuery({
		queryKey: ["orders", "qr", orderQrCode],
		queryFn: async () => ordersService.getOrderByQr(orderQrCode),
		refetchInterval: 5_000,
	});

	const order = orderQuery.data?.data.order;
	const items = orderQuery.data?.data.items ?? [];
	const statusMeta = useMemo(() => {
		switch (order?.status) {
			case "open":
				return { label: "Open", className: "bg-blue-50 text-blue-700" };
			case "preparing":
				return { label: "Preparing", className: "bg-amber-50 text-amber-700" };
			case "ready":
				return { label: "Ready", className: "bg-green-50 text-green-700" };
			case "closed":
				return { label: "Closed", className: "bg-zinc-100 text-zinc-700" };
			case "cancelled":
				return { label: "Cancelled", className: "bg-red-50 text-red-700" };
			default:
				return order?.status
					? {
							label: String(order.status),
							className: "bg-muted text-foreground",
						}
					: null;
		}
	}, [order?.status]);

	const updatedAtLabel = useMemo(() => {
		if (!orderQuery.dataUpdatedAt) return null;
		return new Intl.DateTimeFormat(undefined, {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		}).format(new Date(orderQuery.dataUpdatedAt));
	}, [orderQuery.dataUpdatedAt]);

	return (
		<AppShell
			title="Order status"
			description={
				<span>
					QR: <span className="font-mono text-xs">{orderQrCode}</span>
				</span>
			}
			maxWidth="2xl"
			actions={
				<div className="flex items-center gap-2">
					<Button variant="outline" asChild>
						<Link to="/">Home</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link to="/admin">Admin</Link>
					</Button>
				</div>
			}
		>
			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<CardTitle>Status</CardTitle>
							<CardDescription>
								This page refreshes automatically every 5 seconds.
							</CardDescription>
						</div>
						{statusMeta && (
							<span
								className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
							>
								{statusMeta.label}
							</span>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{orderQuery.isLoading && (
						<p className="text-muted-foreground text-sm">Loading order…</p>
					)}
					{orderQuery.isError && (
						<p className="text-destructive text-sm">
							{orderQuery.error instanceof Error
								? orderQuery.error.message
								: "Failed to load order"}
						</p>
					)}
					{order && (
						<div className="flex flex-col gap-4">
							<div className="grid gap-3 sm:grid-cols-3">
								<div className="rounded-md border p-3">
									<p className="text-muted-foreground text-xs">Order</p>
									<p className="text-sm font-medium">#{order.id}</p>
								</div>
								<div className="rounded-md border p-3">
									<p className="text-muted-foreground text-xs">Total</p>
									<p className="text-sm font-medium">
										{formatCents(order.total)}
									</p>
								</div>
								<div className="rounded-md border p-3">
									<p className="text-muted-foreground text-xs">Updated</p>
									<p className="text-sm font-medium">{updatedAtLabel ?? "—"}</p>
								</div>
							</div>

							<div>
								<p className="text-sm font-medium">Items</p>
								{items.length === 0 ? (
									<p className="text-muted-foreground text-sm">No items.</p>
								) : (
									<ul className="mt-2 space-y-2">
										{items.map((item) => (
											<li
												key={item.id}
												className="flex items-start justify-between gap-3 rounded-md border p-3"
											>
												<div>
													<p className="text-sm font-medium">
														{menuItemNameById.get(item.menu_item_id) ??
															`Item #${item.menu_item_id}`}
													</p>
													<p className="text-muted-foreground text-xs">
														{formatCents(item.price_at_time)} × {item.quantity}
													</p>
													{item.notes && (
														<p className="text-muted-foreground mt-1 text-xs">
															Note: {item.notes}
														</p>
													)}
												</div>
												<p className="text-sm font-medium">
													{formatCents(item.price_at_time * item.quantity)}
												</p>
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					)}
				</CardContent>
				<CardFooter>
					<div className="flex w-full items-center justify-between gap-3">
						<p className="text-muted-foreground text-xs">
							{orderQuery.isFetching ? "Refreshing…" : ""}
						</p>
						<Button
							variant="outline"
							onClick={() => orderQuery.refetch()}
							disabled={orderQuery.isFetching}
						>
							Refresh
						</Button>
					</div>
				</CardFooter>
			</Card>
		</AppShell>
	);
}
