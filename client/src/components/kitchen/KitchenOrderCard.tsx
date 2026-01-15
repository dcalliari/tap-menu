import { useMemo } from "react";
import {
	Clock,
	ChefHat,
	CheckCircle,
	ArrowRight,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/services/orders.service";

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

interface KitchenOrderCardProps {
	order: Order;
	menuItemNameById: Map<number, string>;
	onAdvanceStatus: (orderId: number, newStatus: OrderStatus) => void;
	onCancel: (orderId: number) => void;
	isPending: boolean;
}

function getStatusConfig(status: OrderStatus) {
	switch (status) {
		case "open":
			return {
				icon: Clock,
				label: "New Order",
				color: "text-yellow-600",
				bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
				borderColor: "border-yellow-200 dark:border-yellow-800",
				nextStatus: "preparing" as OrderStatus,
				nextLabel: "Start Preparing",
			};
		case "preparing":
			return {
				icon: ChefHat,
				label: "Preparing",
				color: "text-orange-600",
				bgColor: "bg-orange-50 dark:bg-orange-900/20",
				borderColor: "border-orange-200 dark:border-orange-800",
				nextStatus: "ready" as OrderStatus,
				nextLabel: "Mark Ready",
			};
		case "ready":
			return {
				icon: CheckCircle,
				label: "Ready",
				color: "text-green-600",
				bgColor: "bg-green-50 dark:bg-green-900/20",
				borderColor: "border-green-200 dark:border-green-800",
				nextStatus: "closed" as OrderStatus,
				nextLabel: "Complete",
			};
		default:
			return {
				icon: Clock,
				label: status,
				color: "text-muted-foreground",
				bgColor: "bg-muted/50",
				borderColor: "border-border",
				nextStatus: undefined,
				nextLabel: undefined,
			};
	}
}

function formatTimeAgo(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);

	if (diffMins < 1) return "Just now";
	if (diffMins === 1) return "1 min ago";
	if (diffMins < 60) return `${diffMins} mins ago`;

	const diffHours = Math.floor(diffMins / 60);
	if (diffHours === 1) return "1 hour ago";
	return `${diffHours} hours ago`;
}

export function KitchenOrderCard({
	order,
	menuItemNameById,
	onAdvanceStatus,
	onCancel,
	isPending,
}: KitchenOrderCardProps) {
	const config = getStatusConfig(order.status);
	const StatusIcon = config.icon;

	const itemCount = useMemo(() => {
		return order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
	}, [order.items]);

	return (
		<div
			className={cn(
				"rounded-xl border-2 p-4 transition-all duration-200",
				config.bgColor,
				config.borderColor,
				"hover:shadow-md",
			)}
		>
			{/* Header */}
			<div className="flex items-start justify-between gap-2 mb-3">
				<div>
					<div className="flex items-center gap-2">
						<span className="text-lg font-bold">#{order.id}</span>
						<div
							className={cn(
								"flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
								config.color,
							)}
						>
							<StatusIcon className="h-3 w-3" />
							{config.label}
						</div>
					</div>
					<p className="text-sm text-muted-foreground">
						Table {order.table_id}
					</p>
				</div>
				<div className="text-right">
					<p className="text-xs text-muted-foreground">
						{formatTimeAgo(order.created_at)}
					</p>
					<p className="text-xs text-muted-foreground">{itemCount} items</p>
				</div>
			</div>

			{/* Items */}
			{order.items && order.items.length > 0 && (
				<div className="space-y-2 mb-4">
					{order.items.map((item) => {
						const name = menuItemNameById.get(item.menu_item_id);
						return (
							<div key={item.id} className="flex items-start gap-2">
								<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-foreground/10 text-xs font-bold">
									{item.quantity}
								</span>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">
										{name ?? `Item #${item.menu_item_id}`}
									</p>
									{item.notes && (
										<p className="text-xs text-muted-foreground italic truncate">
											{item.notes}
										</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Actions */}
			<div className="flex gap-2">
				{config.nextStatus && config.nextLabel && (
					<Button
						size="sm"
						className="flex-1 gap-1"
						onClick={() => onAdvanceStatus(order.id, config.nextStatus as OrderStatus)}
						disabled={isPending}
					>
						<ArrowRight className="h-4 w-4" />
						{config.nextLabel}
					</Button>
				)}
				{order.status !== "closed" && order.status !== "cancelled" && (
					<Button
						size="sm"
						variant="ghost"
						className="text-destructive hover:text-destructive hover:bg-destructive/10"
						onClick={() => onCancel(order.id)}
						disabled={isPending}
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}

// Skeleton for loading state
export function KitchenOrderCardSkeleton() {
	return (
		<div className="rounded-xl border-2 border-border p-4 animate-pulse">
			<div className="flex items-start justify-between gap-2 mb-3">
				<div>
					<div className="h-6 w-16 bg-muted rounded" />
					<div className="h-4 w-20 bg-muted rounded mt-1" />
				</div>
				<div className="text-right">
					<div className="h-3 w-16 bg-muted rounded" />
					<div className="h-3 w-12 bg-muted rounded mt-1" />
				</div>
			</div>
			<div className="space-y-2 mb-4">
				<div className="h-5 w-full bg-muted rounded" />
				<div className="h-5 w-3/4 bg-muted rounded" />
			</div>
			<div className="h-8 w-full bg-muted rounded" />
		</div>
	);
}
