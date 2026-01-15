import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import { toast } from "sonner";
import { Clock, ChefHat, CheckCircle, RefreshCw, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	KitchenOrderCard,
	KitchenOrderCardSkeleton,
} from "@/components/kitchen/KitchenOrderCard";
import { useAllMenuItems } from "@/hooks/useMenu";
import { getAuthToken } from "@/lib/auth-token";
import { ordersService } from "@/services";
import type { OrderStatus } from "@/services/orders.service";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kitchen")({
	beforeLoad: () => {
		const token = getAuthToken();
		if (!token) {
			throw redirect({ to: "/login" });
		}
	},
	component: KitchenPage,
});

type OrderItem = {
	id: number;
	menu_item_id: number;
	quantity: number;
	price_at_time: number;
	notes: string | null;
};

type Order = {
	id: number;
	table_id: number;
	status: OrderStatus;
	total: number;
	created_at: string;
	items?: OrderItem[];
};

const COLUMNS = [
	{
		status: "open" as OrderStatus,
		title: "Pending",
		icon: Clock,
		color: "text-yellow-600",
		bgHeader: "bg-yellow-100 dark:bg-yellow-900/30",
	},
	{
		status: "preparing" as OrderStatus,
		title: "Preparing",
		icon: ChefHat,
		color: "text-orange-600",
		bgHeader: "bg-orange-100 dark:bg-orange-900/30",
	},
	{
		status: "ready" as OrderStatus,
		title: "Ready",
		icon: CheckCircle,
		color: "text-green-600",
		bgHeader: "bg-green-100 dark:bg-green-900/30",
	},
];

function KitchenPage() {
	const queryClient = useQueryClient();
	const lastUpdateRef = useRef<number>(Date.now());

	// Fetch all orders for the three columns
	const ordersQuery = useQuery({
		queryKey: ["orders", "kitchen"],
		queryFn: async () => {
			// Fetch orders for all three statuses
			const [openRes, preparingRes, readyRes] = await Promise.all([
				ordersService.listOrders({ status: "open" }),
				ordersService.listOrders({ status: "preparing" }),
				ordersService.listOrders({ status: "ready" }),
			]);

			return {
				open: openRes.data,
				preparing: preparingRes.data,
				ready: readyRes.data,
			};
		},
		refetchInterval: 10000, // Auto-refresh every 10 seconds
	});

	// Fetch all menu items for name lookup
	const menuItemsQuery = useAllMenuItems();
	const menuItemNameById = useMemo(() => {
		const items = menuItemsQuery.data?.data ?? [];
		return new Map(items.map((mi) => [mi.id, mi.name] as const));
	}, [menuItemsQuery.data]);

	// Update status mutation
	const updateStatusMutation = useMutation({
		mutationFn: async (input: { id: number; status: OrderStatus }) =>
			ordersService.updateOrderStatus(input.id, input.status),
		onSuccess: async () => {
			lastUpdateRef.current = Date.now();
			await queryClient.invalidateQueries({ queryKey: ["orders", "kitchen"] });
			toast.success("Order updated");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update order status",
			);
		},
	});

	const handleAdvanceStatus = (orderId: number, newStatus: OrderStatus) => {
		updateStatusMutation.mutate({ id: orderId, status: newStatus });
	};

	const handleCancel = (orderId: number) => {
		updateStatusMutation.mutate({ id: orderId, status: "cancelled" });
	};

	// Get orders by status
	const ordersByStatus = useMemo(() => {
		if (!ordersQuery.data) {
			return { open: [], preparing: [], ready: [] };
		}
		return ordersQuery.data;
	}, [ordersQuery.data]);

	// Count total active orders
	const totalActiveOrders = useMemo(() => {
		return (
			ordersByStatus.open.length +
			ordersByStatus.preparing.length +
			ordersByStatus.ready.length
		);
	}, [ordersByStatus]);

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
				<div className="flex items-center justify-between px-4 py-3">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<ChefHat className="h-5 w-5" />
						</div>
						<div>
							<h1 className="text-lg font-bold">Kitchen Display</h1>
							<p className="text-xs text-muted-foreground">
								{totalActiveOrders} active order
								{totalActiveOrders !== 1 ? "s" : ""}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => ordersQuery.refetch()}
							disabled={ordersQuery.isFetching}
						>
							<RefreshCw
								className={cn(
									"h-4 w-4 mr-1",
									ordersQuery.isFetching && "animate-spin",
								)}
							/>
							Refresh
						</Button>
						<Button variant="outline" size="sm" asChild>
							<Link to="/admin">
								<Settings className="h-4 w-4 mr-1" />
								Admin
							</Link>
						</Button>
					</div>
				</div>
			</header>

			{/* Kanban Board */}
			<main className="p-4">
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
					{COLUMNS.map((column) => {
						const Icon = column.icon;
						const orders =
							ordersByStatus[column.status as keyof typeof ordersByStatus] ??
							[];

						return (
							<div key={column.status} className="flex flex-col">
								{/* Column Header */}
								<div
									className={cn(
										"flex items-center justify-between rounded-t-xl px-4 py-3",
										column.bgHeader,
									)}
								>
									<div className="flex items-center gap-2">
										<Icon className={cn("h-5 w-5", column.color)} />
										<h2 className="font-semibold">{column.title}</h2>
									</div>
									<span
										className={cn(
											"flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold",
											column.color,
											"bg-background",
										)}
									>
										{orders.length}
									</span>
								</div>

								{/* Column Content */}
								<div className="flex-1 space-y-3 rounded-b-xl border border-t-0 bg-muted/20 p-3 min-h-[calc(100vh-200px)]">
									{ordersQuery.isLoading ? (
										<>
											<KitchenOrderCardSkeleton />
											<KitchenOrderCardSkeleton />
										</>
									) : orders.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-12 text-center">
											<Icon className="h-12 w-12 text-muted-foreground/30 mb-2" />
											<p className="text-sm text-muted-foreground">
												No {column.title.toLowerCase()} orders
											</p>
										</div>
									) : (
										orders.map((order: Order) => (
											<KitchenOrderCard
												key={order.id}
												order={order}
												menuItemNameById={menuItemNameById}
												onAdvanceStatus={handleAdvanceStatus}
												onCancel={handleCancel}
												isPending={updateStatusMutation.isPending}
											/>
										))
									)}
								</div>
							</div>
						);
					})}
				</div>
			</main>

			{/* Footer status bar */}
			<footer className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur px-4 py-2">
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<span>
						Auto-refreshing every 10 seconds
						{ordersQuery.isFetching && " • Updating..."}
					</span>
					<span>
						Last updated: {new Date(lastUpdateRef.current).toLocaleTimeString()}
					</span>
				</div>
			</footer>
		</div>
	);
}
