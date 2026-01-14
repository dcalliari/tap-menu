import { useQuery } from "@tanstack/react-query";

import { menuService } from "@/services";

export function useMenuCategories() {
	return useQuery({
		queryKey: ["menu", "categories"],
		queryFn: async () => menuService.listMenuCategories(),
	});
}

export function useMenuItems(categoryId: string | undefined) {
	return useQuery({
		queryKey: ["menu", "items", categoryId],
		enabled: Boolean(categoryId),
		queryFn: async () => {
			if (!categoryId) {
				throw new Error("categoryId is required");
			}
			return menuService.listMenuItems(categoryId);
		},
	});
}

export function useAllMenuItems() {
	return useQuery({
		queryKey: ["menu", "items", "all"],
		queryFn: async () => menuService.listMenuItems(),
	});
}
