import { apiClient, parseJsonOrThrow } from "@/lib/api-client";

type ListMenuCategoriesRes = Awaited<
	ReturnType<typeof apiClient.menu.categories.$get>
>;
type ListMenuCategoriesJson = Awaited<
	ReturnType<ListMenuCategoriesRes["json"]>
>;
type ListMenuCategoriesSuccess = Extract<
	ListMenuCategoriesJson,
	{ success: true }
>;

type GetMenuCategoryRes = Awaited<
	ReturnType<(typeof apiClient.menu.categories)[":id"]["$get"]>
>;
type GetMenuCategoryJson = Awaited<ReturnType<GetMenuCategoryRes["json"]>>;
type GetMenuCategorySuccess = Extract<GetMenuCategoryJson, { success: true }>;

type CreateMenuCategoryRes = Awaited<
	ReturnType<typeof apiClient.menu.categories.$post>
>;
type CreateMenuCategoryJson = Awaited<
	ReturnType<CreateMenuCategoryRes["json"]>
>;
type CreateMenuCategorySuccess = Extract<
	CreateMenuCategoryJson,
	{ success: true }
>;

type UpdateMenuCategoryRes = Awaited<
	ReturnType<(typeof apiClient.menu.categories)[":id"]["$put"]>
>;
type UpdateMenuCategoryJson = Awaited<
	ReturnType<UpdateMenuCategoryRes["json"]>
>;
type UpdateMenuCategorySuccess = Extract<
	UpdateMenuCategoryJson,
	{ success: true }
>;

type DeleteMenuCategoryRes = Awaited<
	ReturnType<(typeof apiClient.menu.categories)[":id"]["$delete"]>
>;
type DeleteMenuCategoryJson = Awaited<
	ReturnType<DeleteMenuCategoryRes["json"]>
>;
type DeleteMenuCategorySuccess = Extract<
	DeleteMenuCategoryJson,
	{ success: true }
>;

type ListMenuItemsRes = Awaited<ReturnType<typeof apiClient.menu.items.$get>>;
type ListMenuItemsJson = Awaited<ReturnType<ListMenuItemsRes["json"]>>;
type ListMenuItemsSuccess = Extract<ListMenuItemsJson, { success: true }>;

type GetMenuItemRes = Awaited<
	ReturnType<(typeof apiClient.menu.items)[":id"]["$get"]>
>;
type GetMenuItemJson = Awaited<ReturnType<GetMenuItemRes["json"]>>;
type GetMenuItemSuccess = Extract<GetMenuItemJson, { success: true }>;

type CreateMenuItemRes = Awaited<ReturnType<typeof apiClient.menu.items.$post>>;
type CreateMenuItemJson = Awaited<ReturnType<CreateMenuItemRes["json"]>>;
type CreateMenuItemSuccess = Extract<CreateMenuItemJson, { success: true }>;

type UpdateMenuItemRes = Awaited<
	ReturnType<(typeof apiClient.menu.items)[":id"]["$put"]>
>;
type UpdateMenuItemJson = Awaited<ReturnType<UpdateMenuItemRes["json"]>>;
type UpdateMenuItemSuccess = Extract<UpdateMenuItemJson, { success: true }>;

type DeleteMenuItemRes = Awaited<
	ReturnType<(typeof apiClient.menu.items)[":id"]["$delete"]>
>;
type DeleteMenuItemJson = Awaited<ReturnType<DeleteMenuItemRes["json"]>>;
type DeleteMenuItemSuccess = Extract<DeleteMenuItemJson, { success: true }>;

export async function listMenuCategories() {
	const res = await apiClient.menu.categories.$get();
	return parseJsonOrThrow<ListMenuCategoriesSuccess>(res);
}

export async function getMenuCategory(id: number) {
	const res = await apiClient.menu.categories[":id"].$get({
		param: { id: String(id) },
	});
	return parseJsonOrThrow<GetMenuCategorySuccess>(res);
}

export async function createMenuCategory(input: {
	name: string;
	description?: string;
}) {
	const res = await apiClient.menu.categories.$post({ json: input });
	return parseJsonOrThrow<CreateMenuCategorySuccess>(res);
}

export async function updateMenuCategory(
	id: number,
	input: { name?: string; description?: string },
) {
	const res = await apiClient.menu.categories[":id"].$put({
		param: { id: String(id) },
		json: input,
	});
	return parseJsonOrThrow<UpdateMenuCategorySuccess>(res);
}

export async function deleteMenuCategory(id: number) {
	const res = await apiClient.menu.categories[":id"].$delete({
		param: { id: String(id) },
	});
	return parseJsonOrThrow<DeleteMenuCategorySuccess>(res);
}

export async function listMenuItems(categoryId?: string | string[]) {
	const categoryIdOrEmpty: string | string[] = categoryId ?? "";
	const res = await apiClient.menu.items.$get({
		query: {
			// Server treats empty string as undefined
			categoryId: categoryIdOrEmpty,
		},
	});
	return parseJsonOrThrow<ListMenuItemsSuccess>(res);
}

export async function getMenuItem(id: number) {
	const res = await apiClient.menu.items[":id"].$get({
		param: { id: String(id) },
	});
	return parseJsonOrThrow<GetMenuItemSuccess>(res);
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
	return parseJsonOrThrow<CreateMenuItemSuccess>(res);
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
	return parseJsonOrThrow<UpdateMenuItemSuccess>(res);
}

export async function deleteMenuItem(id: number) {
	const res = await apiClient.menu.items[":id"].$delete({
		param: { id: String(id) },
	});
	return parseJsonOrThrow<DeleteMenuItemSuccess>(res);
}
