import { apiClient, parseJsonOrThrow } from "@/lib/api-client";

export async function listTables() {
	const res = await apiClient.tables.$get();
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function getTable(id: number) {
	const res = await apiClient.tables[":id"].$get({
		param: { id: String(id) },
	});
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function createTable(input: { number: string }) {
	const res = await apiClient.tables.$post({ json: { number: input.number } });
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function updateTable(id: number, input: { number?: string }) {
	const res = await apiClient.tables[":id"].$put({
		param: { id: String(id) },
		json: input,
	});
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function deleteTable(id: number) {
	const res = await apiClient.tables[":id"].$delete({
		param: { id: String(id) },
	});
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function getTableByQr(qrCode: string) {
	const res = await apiClient.tables.qr[":qr_code"].$get({
		param: { qr_code: qrCode },
	});
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function getTableQrSvg(id: number) {
	const res = await apiClient.tables[":id"]["qr.svg"].$get({
		param: { id: String(id) },
	});
	if (!res.ok) {
		// This endpoint returns svg body on success
		await parseJsonOrThrow(res);
	}
	return res.text();
}
