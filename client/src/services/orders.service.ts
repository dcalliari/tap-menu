import { apiClient, parseJsonOrThrow } from "@/lib/api-client";

type ListOrdersRes = Awaited<ReturnType<typeof apiClient.orders.$get>>;
type ListOrdersJson = Awaited<ReturnType<ListOrdersRes["json"]>>;
type ListOrdersSuccess = Extract<ListOrdersJson, { success: true }>;

type CreateOrderRes = Awaited<ReturnType<typeof apiClient.orders.$post>>;
type CreateOrderJson = Awaited<ReturnType<CreateOrderRes["json"]>>;
type CreateOrderSuccess = Extract<CreateOrderJson, { success: true }>;

type GetOrderByQrRes = Awaited<
	ReturnType<(typeof apiClient.orders.qr)[":qr_code"]["$get"]>
>;
type GetOrderByQrJson = Awaited<ReturnType<GetOrderByQrRes["json"]>>;
type GetOrderByQrSuccess = Extract<GetOrderByQrJson, { success: true }>;

type GetOrderRes = Awaited<
	ReturnType<(typeof apiClient.orders)[":id"]["$get"]>
>;
type GetOrderJson = Awaited<ReturnType<GetOrderRes["json"]>>;
type GetOrderSuccess = Extract<GetOrderJson, { success: true }>;

type UpdateOrderStatusRes = Awaited<
	ReturnType<(typeof apiClient.orders)[":id"]["status"]["$patch"]>
>;
type UpdateOrderStatusJson = Awaited<ReturnType<UpdateOrderStatusRes["json"]>>;
type UpdateOrderStatusSuccess = Extract<
	UpdateOrderStatusJson,
	{ success: true }
>;

export type OrderStatus =
	| "open"
	| "preparing"
	| "ready"
	| "closed"
	| "cancelled";

export async function createOrder(input: {
	table_qr_code: string;
	comanda_qr_code?: string;
	items: { menu_item_id: number; quantity: number; notes?: string }[];
}) {
	const res = await apiClient.orders.$post({ json: input });
	return parseJsonOrThrow<CreateOrderSuccess>(res);
}

export async function getOrderByQr(qrCode: string) {
	const res = await apiClient.orders.qr[":qr_code"].$get({
		param: { qr_code: qrCode },
	});
	return parseJsonOrThrow<GetOrderByQrSuccess>(res);
}

export async function listOrders(query: {
	tableId?: string | string[];
	status?: OrderStatus;
}) {
	const res = await apiClient.orders.$get({
		query: {
			tableId: query.tableId ?? "",
			status: query.status,
		},
	});
	return parseJsonOrThrow<ListOrdersSuccess>(res);
}

export async function getOrder(id: number) {
	const res = await apiClient.orders[":id"].$get({
		param: { id: String(id) },
	});
	return parseJsonOrThrow<GetOrderSuccess>(res);
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
	const res = await apiClient.orders[":id"].status.$patch({
		param: { id: String(id) },
		json: { status },
	});
	return parseJsonOrThrow<UpdateOrderStatusSuccess>(res);
}
