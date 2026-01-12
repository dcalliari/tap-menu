import { apiClient, parseJsonOrThrow } from "@/lib/api-client";

export async function listMenuCategories() {
	const res = await apiClient.menu.categories.$get();
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function getMenuCategory(id: number) {
	const res = await apiClient.menu.categories[":id"].$get({
		param: { id: String(id) },
	});
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function createMenuCategory(input: {
	name: string;
	description?: string;
}) {
	const res = await apiClient.menu.categories.$post({ json: input });
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function updateMenuCategory(
	id: number,
	input: { name?: string; description?: string },
) {
	const res = await apiClient.menu.categories[":id"].$put({
		param: { id: String(id) },
		json: input,
	});
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function deleteMenuCategory(id: number) {
	const res = await apiClient.menu.categories[":id"].$delete({
		param: { id: String(id) },
	});
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function listMenuItems(categoryId: string | string[]) {
	const res = await apiClient.menu.items.$get({ query: { categoryId } });
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function getMenuItem(id: number) {
	const res = await apiClient.menu.items[":id"].$get({
		param: { id: String(id) },
	});
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function createMenuItem(input: {
	name: string;
	description?: string;
	category_id?: number;
	price: number;
	image_url?: string;
	is_available?: boolean;
}) {
	const res = await apiClient.menu.items.$post({ json: input });
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function updateMenuItem(
	id: number,
	input: {
		name?: string;
		description?: string;
		category_id?: number;
		price?: number;
		image_url?: string;
		is_available?: boolean;
	},
) {
	const res = await apiClient.menu.items[":id"].$put({
		param: { id: String(id) },
		json: input,
	});
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}

export async function deleteMenuItem(id: number) {
	const res = await apiClient.menu.items[":id"].$delete({
		param: { id: String(id) },
	});
	return parseJsonOrThrow<Awaited<ReturnType<(typeof res)["json"]>>>(res);
}
