import { useState } from "react";
import { toast } from "sonner";
import {
	Minus,
	Plus,
	ShoppingBag,
	Trash2,
	QrCode,
	Send,
	Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type CartLine = {
	menuItemId: number;
	name: string;
	price: number;
	quantity: number;
	notes?: string;
};

interface CartSheetProps {
	tableNumber: string;
	cartLines: CartLine[];
	cartTotal: number;
	cartCount: number;
	formatPrice: (cents: number) => string;
	onUpdateQuantity: (itemId: number, delta: number) => void;
	onRemove: (itemId: number) => void;
	onClear: () => void;
	onPlaceOrder: (comandaQrCode?: string) => void;
	isPending: boolean;
	requireComandaScan?: boolean;
}

export function CartSheet({
	tableNumber,
	cartLines,
	cartTotal,
	cartCount,
	formatPrice,
	onUpdateQuantity,
	onRemove,
	onClear,
	onPlaceOrder,
	isPending,
	requireComandaScan = true,
}: CartSheetProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [comandaDialogOpen, setComandaDialogOpen] = useState(false);
	const [comandaQrCode, setComandaQrCode] = useState("");

	const handlePlaceOrder = () => {
		if (cartLines.length === 0) return;

		if (requireComandaScan) {
			setComandaDialogOpen(true);
		} else {
			onPlaceOrder();
			setIsOpen(false);
		}
	};

	const handleConfirmWithComanda = () => {
		if (!comandaQrCode.trim()) {
			toast.error("Please enter your comanda QR code");
			return;
		}
		onPlaceOrder(comandaQrCode.trim());
		setComandaDialogOpen(false);
		setIsOpen(false);
		setComandaQrCode("");
	};

	return (
		<>
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetTrigger asChild>
					<Button
						className={cn(
							"fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full px-6 py-6 shadow-lg",
							"transition-all duration-300 hover:scale-105",
						)}
						size="lg"
					>
						<ShoppingBag className="mr-2 h-5 w-5" />
						<span className="font-semibold">View Order</span>
						{cartCount > 0 && (
							<>
								<span className="mx-2">•</span>
								<span className="font-bold">{formatPrice(cartTotal)}</span>
								<span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground text-primary text-sm font-bold">
									{cartCount}
								</span>
							</>
						)}
					</Button>
				</SheetTrigger>

				<SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
					<div className="flex h-full flex-col">
						{/* Drag handle */}
						<div className="flex justify-center pt-3 pb-2">
							<div className="h-1.5 w-12 rounded-full bg-muted" />
						</div>

						<SheetHeader className="px-6 pb-4 border-b">
							<SheetTitle className="flex items-center gap-2 text-2xl">
								<ShoppingBag className="h-6 w-6 text-primary" />
								Your Order
								<span className="ml-auto text-sm font-normal text-muted-foreground">
									Table {tableNumber}
								</span>
							</SheetTitle>
						</SheetHeader>

						{cartLines.length === 0 ? (
							<div className="flex flex-1 flex-col items-center justify-center py-12 text-center px-6">
								<ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
								<p className="text-muted-foreground font-medium">
									Your cart is empty
								</p>
								<p className="text-sm text-muted-foreground/70 mt-1">
									Add items from the menu to place your order
								</p>
							</div>
						) : (
							<>
								{/* Cart items */}
								<div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
									{cartLines.map((item) => (
										<div
											key={item.menuItemId}
											className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3"
										>
											<div className="flex-1 min-w-0">
												<h4 className="font-medium truncate">{item.name}</h4>
												<p className="text-sm text-primary font-semibold">
													{formatPrice(item.price * item.quantity)}
												</p>
												{item.notes && (
													<p className="text-xs text-muted-foreground italic mt-1 truncate">
														{item.notes}
													</p>
												)}
											</div>
											<div className="flex items-center gap-2">
												<Button
													size="icon"
													variant="outline"
													className="h-8 w-8 rounded-full"
													onClick={() => onUpdateQuantity(item.menuItemId, -1)}
												>
													<Minus className="h-3 w-3" />
												</Button>
												<span className="w-6 text-center font-semibold">
													{item.quantity}
												</span>
												<Button
													size="icon"
													variant="outline"
													className="h-8 w-8 rounded-full"
													onClick={() => onUpdateQuantity(item.menuItemId, 1)}
												>
													<Plus className="h-3 w-3" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													className="h-8 w-8 text-destructive hover:text-destructive"
													onClick={() => onRemove(item.menuItemId)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									))}
								</div>

								{/* Footer with total and actions */}
								<div className="border-t bg-card p-6 space-y-4">
									<div className="flex items-center justify-between text-lg">
										<span className="font-medium">Total</span>
										<span className="font-bold text-primary text-xl">
											{formatPrice(cartTotal)}
										</span>
									</div>
									<div className="flex gap-3">
										<Button
											variant="outline"
											className="flex-1"
											onClick={onClear}
										>
											Clear
										</Button>
										<Button
											className="flex-2 py-6 rounded-full text-lg font-semibold"
											onClick={handlePlaceOrder}
											disabled={isPending || cartLines.length === 0}
										>
											{isPending ? (
												<>
													<Loader2 className="mr-2 h-5 w-5 animate-spin" />
													Sending...
												</>
											) : (
												<>
													<Send className="mr-2 h-5 w-5" />
													Place Order
												</>
											)}
										</Button>
									</div>
								</div>
							</>
						)}
					</div>
				</SheetContent>
			</Sheet>

			{/* Comanda QR Dialog */}
			<AlertDialog open={comandaDialogOpen} onOpenChange={setComandaDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<QrCode className="h-5 w-5 text-primary" />
							Scan Your Comanda
						</AlertDialogTitle>
						<AlertDialogDescription>
							Please scan or enter your comanda QR code to associate this order
							with your tab.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="py-4">
						<Input
							placeholder="Enter comanda QR code..."
							value={comandaQrCode}
							onChange={(e) => setComandaQrCode(e.target.value)}
							className="text-center text-lg"
							autoFocus
						/>
						<p className="text-xs text-muted-foreground text-center mt-2">
							The comanda QR code is on your receipt card
						</p>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setComandaQrCode("")}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmWithComanda}
							disabled={!comandaQrCode.trim() || isPending}
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Confirming...
								</>
							) : (
								"Confirm Order"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
