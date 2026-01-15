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
				<Button variant="outline" asChild>
					<Link to="/admin">Admin</Link>
				</Button>
			}
		>
			<Card>
				<CardHeader>
					<CardTitle>Status</CardTitle>
					<CardDescription>
						This page refreshes automatically every 5 seconds.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{orderQuery.isLoading && (
						<p className="text-muted-foreground text-sm">Loading…</p>
					)}
					{orderQuery.isError && (
						<p className="text-destructive text-sm">
							{orderQuery.error instanceof Error
								? orderQuery.error.message
								: "Failed to load order"}
						</p>
					)}
					{orderQuery.data && (
						<div className="flex flex-col gap-4">
							<div className="rounded-md border p-3">
								<p className="text-sm font-medium">
									Order #{orderQuery.data.data.order.id}
								</p>
								<p className="text-muted-foreground text-sm">
									Status: {orderQuery.data.data.order.status}
								</p>
								<p className="text-muted-foreground text-sm">
									Total: {formatCents(orderQuery.data.data.order.total)}
								</p>
							</div>

							<div>
								<p className="text-sm font-medium">Items</p>
								{orderQuery.data.data.items.length === 0 ? (
									<p className="text-muted-foreground text-sm">No items.</p>
								) : (
									<ul className="mt-2 space-y-2">
										{orderQuery.data.data.items.map((item) => (
											<li
												key={item.id}
												className="flex items-center justify-between gap-3 rounded-md border p-3"
											>
												<div>
													<p className="text-sm font-medium">
														{menuItemNameById.get(item.menu_item_id) ??
															`Item #${item.menu_item_id}`}
													</p>
													<p className="text-muted-foreground text-xs">
														{formatCents(item.price_at_time)} × {item.quantity}
													</p>
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
					<Button
						variant="outline"
						onClick={() => orderQuery.refetch()}
						disabled={orderQuery.isFetching}
					>
						Refresh
					</Button>
				</CardFooter>
			</Card>
		</AppShell>
	);
}
