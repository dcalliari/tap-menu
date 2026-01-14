import { useQuery } from "@tanstack/react-query";

import { ordersService } from "@/services";
import type { OrderStatus } from "@/services/orders.service";

export function useOrders(
	filter: { status?: OrderStatus; tableId?: string } = {},
) {
	return useQuery({
		queryKey: ["orders", "list", filter],
		queryFn: async () =>
			ordersService.listOrders({
				status: filter.status,
				tableId: filter.tableId,
			}),
	});
}

export function useOrder(id: number, enabled = true) {
	return useQuery({
		queryKey: ["orders", "byId", id],
		enabled,
		queryFn: async () => ordersService.getOrder(id),
	});
}
