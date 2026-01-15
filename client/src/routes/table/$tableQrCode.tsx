import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MapPin, Utensils } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { CartSheet } from "@/components/menu/CartSheet";
import { useMenuCategories, useMenuItems } from "@/hooks/useMenu";
import { ordersService, tablesService } from "@/services";

export const Route = createFileRoute("/table/$tableQrCode")({
	component: TableMenuPage,
});

type CartLine = {
	menuItemId: number;
	name: string;
	price: number;
	quantity: number;
	notes?: string;
};

function formatCents(value: number) {
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: "USD",
	}).format(value / 100);
}

function TableMenuPage() {
	const navigate = useNavigate();
	const { tableQrCode } = Route.useParams();

	// Fetch table info
	const tableQuery = useQuery({
		queryKey: ["tables", "qr", tableQrCode],
		queryFn: async () => tablesService.getTableByQr(tableQrCode),
	});

	// Fetch categories
	const categoriesQuery = useMenuCategories();
	const [selectedCategoryId, setSelectedCategoryId] = useState<
		string | undefined
	>(undefined);

	// Auto-select first category
	useEffect(() => {
		if (selectedCategoryId) return;
		const first = categoriesQuery.data?.data?.[0];
		if (first) {
			setSelectedCategoryId(String(first.id));
		}
	}, [categoriesQuery.data, selectedCategoryId]);

	// Fetch items for selected category
	const itemsQuery = useMenuItems(selectedCategoryId);

	// Cart state
	const [cart, setCart] = useState<Record<number, CartLine>>({});

	const cartLines = useMemo(() => Object.values(cart), [cart]);
	const cartCount = useMemo(
		() => cartLines.reduce((sum, line) => sum + line.quantity, 0),
		[cartLines],
	);
	const cartTotal = useMemo(
		() => cartLines.reduce((sum, line) => sum + line.price * line.quantity, 0),
		[cartLines],
	);

	// Order mutation
	const createOrderMutation = useMutation({
		mutationFn: async (comandaQrCode?: string) => {
			if (cartLines.length === 0) {
				throw new Error("Your cart is empty");
			}

			return ordersService.createOrder({
				table_qr_code: tableQrCode,
				comanda_qr_code: comandaQrCode,
				items: cartLines.map((line) => ({
					menu_item_id: line.menuItemId,
					quantity: line.quantity,
					notes: line.notes?.trim() ? line.notes.trim() : undefined,
				})),
			});
		},
		onSuccess: async (res) => {
			setCart({});
			toast.success("Order placed successfully!");
			const orderQr = res.data.order.qr_code;
			await navigate({
				to: "/order/$orderQrCode",
				params: { orderQrCode: orderQr },
			});
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to place order",
			);
		},
	});

	// Cart handlers
	const handleAddToCart = (item: {
		id: number;
		name: string;
		price: number;
	}) => {
		setCart((prev) => {
			const existing = prev[item.id];
			const nextQty = (existing?.quantity ?? 0) + 1;
			return {
				...prev,
				[item.id]: {
					menuItemId: item.id,
					name: item.name,
					price: item.price,
					quantity: nextQty,
				},
			};
		});
	};

	const handleRemoveFromCart = (itemId: number) => {
		setCart((prev) => {
			const existing = prev[itemId];
			if (!existing) return prev;
			const nextQty = existing.quantity - 1;
			if (nextQty <= 0) {
				const { [itemId]: _removed, ...rest } = prev;
				return rest;
			}
			return {
				...prev,
				[itemId]: { ...existing, quantity: nextQty },
			};
		});
	};

	const handleUpdateQuantity = (itemId: number, delta: number) => {
		if (delta > 0) {
			const existing = cart[itemId];
			if (existing) {
				setCart((prev) => ({
					...prev,
					[itemId]: { ...prev[itemId], quantity: prev[itemId].quantity + 1 },
				}));
			}
		} else {
			handleRemoveFromCart(itemId);
		}
	};

	const handleRemoveItem = (itemId: number) => {
		setCart((prev) => {
			const { [itemId]: _removed, ...rest } = prev;
			return rest;
		});
	};

	const handleClearCart = () => {
		setCart({});
	};

	const handlePlaceOrder = (comandaQrCode?: string) => {
		createOrderMutation.mutate(comandaQrCode);
	};

	// Table info
	const tableNumber = tableQuery.data?.data.number ?? "";
	const isTableLoading = tableQuery.isLoading;
	const isTableError = tableQuery.isError;

	// Categories for tabs
	const categories = categoriesQuery.data?.data ?? [];
	const isCategoriesLoading = categoriesQuery.isLoading;

	// Items
	const items = itemsQuery.data?.data ?? [];
	const isItemsLoading = itemsQuery.isLoading;

	if (isTableError) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-secondary/20 p-4">
				<Card className="w-full max-w-md text-center">
					<CardContent className="pt-6">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
							<MapPin className="h-8 w-8 text-destructive" />
						</div>
						<h2 className="text-xl font-bold mb-2">Table Not Found</h2>
						<p className="text-muted-foreground mb-4">
							This QR code doesn't match any table. Please scan a valid table QR
							code.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-background to-secondary/20">
			{/* Header */}
			<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
				<div className="mx-auto max-w-2xl px-4 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
							<Utensils className="h-5 w-5" />
						</div>
						<div className="flex-1">
							<h1 className="text-lg font-bold">Menu</h1>
							{isTableLoading ? (
								<Skeleton className="h-4 w-20" />
							) : (
								<p className="text-sm text-muted-foreground flex items-center gap-1">
									<MapPin className="h-3 w-3" />
									Table {tableNumber}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Category Tabs */}
				<div className="border-t">
					<div className="mx-auto max-w-2xl">
						<CategoryTabs
							categories={categories}
							activeCategory={selectedCategoryId}
							onCategoryChange={setSelectedCategoryId}
							isLoading={isCategoriesLoading}
						/>
					</div>
				</div>
			</header>

			{/* Menu Items */}
			<main className="mx-auto max-w-2xl px-4 py-6 pb-28">
				{isItemsLoading ? (
					<div className="grid gap-4">
						<Skeleton className="h-32 w-full rounded-xl" />
						<Skeleton className="h-32 w-full rounded-xl" />
						<Skeleton className="h-32 w-full rounded-xl" />
					</div>
				) : items.length === 0 ? (
					<div className="text-center py-12">
						<Utensils className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
						<p className="text-muted-foreground">
							No items in this category yet.
						</p>
					</div>
				) : (
					<div className="grid gap-4">
						{items.map((item) => (
							<MenuItemCard
								key={item.id}
								item={item}
								cartLine={cart[item.id]}
								formatPrice={formatCents}
								onAdd={() => handleAddToCart(item)}
								onRemove={() => handleRemoveFromCart(item.id)}
							/>
						))}
					</div>
				)}
			</main>

			{/* Cart Sheet */}
			<CartSheet
				tableNumber={String(tableNumber)}
				cartLines={cartLines}
				cartTotal={cartTotal}
				cartCount={cartCount}
				formatPrice={formatCents}
				onUpdateQuantity={handleUpdateQuantity}
				onRemove={handleRemoveItem}
				onClear={handleClearCart}
				onPlaceOrder={handlePlaceOrder}
				isPending={createOrderMutation.isPending}
				requireComandaScan={true}
			/>
		</div>
	);
}
