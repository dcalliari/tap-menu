import { useQuery } from "@tanstack/react-query";

import { tablesService } from "@/services";

export function useTables() {
	return useQuery({
		queryKey: ["tables", "list"],
		queryFn: async () => tablesService.listTables(),
	});
}

export function useTableQrSvg(tableId: number | null) {
	return useQuery({
		queryKey: ["tables", "qr", tableId],
		enabled: tableId !== null,
		queryFn: async () => {
			if (tableId === null) {
				throw new Error("tableId is required");
			}
			return tablesService.getTableQrSvg(tableId);
		},
	});
}
