import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";

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
import { useOrder, useOrders } from "@/hooks/useOrders";
import { getAuthToken } from "@/lib/auth-token";
import { ordersService } from "@/services";
import type { OrderStatus } from "@/services/orders.service";

export const Route = createFileRoute("/kitchen")({
	beforeLoad: () => {
		const token = getAuthToken();
		if (!token) {
			throw redirect({ to: "/login" });
		}
	},
	component: KitchenPage,
});

type KitchenFilter = OrderStatus | "all";

const FILTERS: Array<{ key: KitchenFilter; label: string }> = [
	{ key: "open", label: "Open" },
	{ key: "preparing", label: "Preparing" },
	{ key: "ready", label: "Ready" },
	{ key: "closed", label: "Closed" },
	{ key: "cancelled", label: "Cancelled" },
	{ key: "all", label: "All" },
];

function formatCents(value: number) {
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: "USD",
	}).format(value / 100);
}

function KitchenPage() {
	const queryClient = useQueryClient();
	const [statusFilter, setStatusFilter] = useState<KitchenFilter>("open");
	const [expanded, setExpanded] = useState<Record<number, boolean>>({});

	const ordersQuery = useOrders({
		status: statusFilter === "all" ? undefined : statusFilter,
	});

	const menuItemsQuery = useAllMenuItems();
	const menuItemNameById = useMemo(() => {
		const items = menuItemsQuery.data?.data ?? [];
		return new Map(items.map((mi) => [mi.id, mi.name] as const));
	}, [menuItemsQuery.data]);

	const updateStatusMutation = useMutation({
		mutationFn: async (input: { id: number; status: OrderStatus }) =>
			ordersService.updateOrderStatus(input.id, input.status),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
			await queryClient.invalidateQueries({ queryKey: ["orders", "byId"] });
		},
	});

	const visibleOrders = useMemo(
		() => ordersQuery.data?.data ?? [],
		[ordersQuery.data],
	);

	return (
		<AppShell
			title="Kitchen"
			description="Live order queue (admin-only)."
			actions={
				<Button variant="outline" asChild>
					<Link to="/admin">Admin</Link>
				</Button>
			}
		>
			<Card>
				<CardHeader>
					<CardTitle>Orders</CardTitle>
					<CardDescription>Filter and update statuses quickly.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap items-center gap-2">
							{FILTERS.map((f) => (
								<Button
									key={f.key}
									size="sm"
									variant={statusFilter === f.key ? "default" : "outline"}
									onClick={() => setStatusFilter(f.key)}
								>
									{f.label}
								</Button>
							))}
							<Button
								variant="outline"
								onClick={() => ordersQuery.refetch()}
								disabled={ordersQuery.isFetching}
							>
								Refresh
							</Button>
						</div>

						{ordersQuery.isLoading && (
							<p className="text-muted-foreground text-sm">Loading…</p>
						)}
						{ordersQuery.isError && (
							<p className="text-destructive text-sm">Failed to load orders.</p>
						)}

						{ordersQuery.data && visibleOrders.length === 0 && (
							<p className="text-muted-foreground text-sm">
								No orders for this filter.
							</p>
						)}

						{ordersQuery.data && visibleOrders.length > 0 && (
							<ul className="space-y-3">
								{visibleOrders.map((order) => (
									<li key={order.id} className="rounded-md border p-3">
										<OrderRow
											order={order}
											expanded={Boolean(expanded[order.id])}
											onToggle={() =>
												setExpanded((prev) => ({
													...prev,
													[order.id]: !prev[order.id],
												}))
											}
											formatCents={formatCents}
											updateStatusMutation={updateStatusMutation}
											menuItemNameById={menuItemNameById}
										/>
									</li>
								))}
							</ul>
						)}

						{updateStatusMutation.isError && (
							<p className="text-destructive text-sm">
								{updateStatusMutation.error instanceof Error
									? updateStatusMutation.error.message
									: "Failed to update order status"}
							</p>
						)}
					</div>
				</CardContent>
				<CardFooter>
					<p className="text-muted-foreground text-sm">
						Tip: keep this open on a tablet.
					</p>
				</CardFooter>
			</Card>
		</AppShell>
	);
}

function OrderRow(props: {
	order: { id: number; table_id: number; status: OrderStatus; total: number };
	expanded: boolean;
	onToggle: () => void;
	formatCents: (value: number) => string;
	updateStatusMutation: {
		isPending: boolean;
		mutate: (input: { id: number; status: OrderStatus }) => void;
	};
	menuItemNameById: Map<number, string>;
}) {
	const orderDetailsQuery = useOrder(props.order.id, props.expanded);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0">
					<p className="text-sm font-medium">
						Order #{props.order.id} • Table {props.order.table_id}
					</p>
					<p className="text-muted-foreground text-xs">
						Status: {props.order.status} • Total:{" "}
						{props.formatCents(props.order.total)}
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<Button variant="outline" size="sm" onClick={props.onToggle}>
						{props.expanded ? "Hide" : "Details"}
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={props.updateStatusMutation.isPending}
						onClick={() =>
							props.updateStatusMutation.mutate({
								id: props.order.id,
								status: "preparing",
							})
						}
					>
						Preparing
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={props.updateStatusMutation.isPending}
						onClick={() =>
							props.updateStatusMutation.mutate({
								id: props.order.id,
								status: "ready",
							})
						}
					>
						Ready
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={props.updateStatusMutation.isPending}
						onClick={() =>
							props.updateStatusMutation.mutate({
								id: props.order.id,
								status: "closed",
							})
						}
					>
						Close
					</Button>
					<Button
						variant="destructive"
						size="sm"
						disabled={props.updateStatusMutation.isPending}
						onClick={() =>
							props.updateStatusMutation.mutate({
								id: props.order.id,
								status: "cancelled",
							})
						}
					>
						Cancel
					</Button>
				</div>
			</div>

			{props.expanded && (
				<div className="rounded-md bg-muted/30 p-3">
					{orderDetailsQuery.isLoading && (
						<p className="text-muted-foreground text-sm">Loading items…</p>
					)}
					{orderDetailsQuery.isError && (
						<p className="text-destructive text-sm">
							Failed to load order details.
						</p>
					)}
					{orderDetailsQuery.data && (
						<div className="flex flex-col gap-3">
							<p className="text-sm font-medium">Items</p>
							{orderDetailsQuery.data.data.items.length === 0 ? (
								<p className="text-muted-foreground text-sm">No items.</p>
							) : (
								<ul className="space-y-2">
									{orderDetailsQuery.data.data.items.map((item) => {
										const name = props.menuItemNameById.get(item.menu_item_id);
										return (
											<li
												key={item.id}
												className="flex items-start justify-between gap-3"
											>
												<div className="min-w-0">
													<p className="truncate text-sm">
														{name ?? `Item #${item.menu_item_id}`}
													</p>
													<p className="text-muted-foreground text-xs">
														{props.formatCents(item.price_at_time)} ×{" "}
														{item.quantity}
														{item.notes ? ` • ${item.notes}` : ""}
													</p>
												</div>
												<p className="text-sm font-medium">
													{props.formatCents(
														item.price_at_time * item.quantity,
													)}
												</p>
											</li>
										);
									})}
								</ul>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
