import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

type MenuItem = {
	id: number;
	name: string;
	description: string | null;
	price: number;
	image_url: string | null;
	is_available: boolean;
};

type CartLine = {
	menuItemId: number;
	name: string;
	price: number;
	quantity: number;
	notes?: string;
};

interface MenuItemCardProps {
	item: MenuItem;
	cartLine?: CartLine;
	onAdd: (item: MenuItem) => void;
	onRemove: (itemId: number) => void;
	formatPrice: (cents: number) => string;
}

export function MenuItemCard({
	item,
	cartLine,
	onAdd,
	onRemove,
	formatPrice,
}: MenuItemCardProps) {
	const quantity = cartLine?.quantity ?? 0;
	const isAvailable = item.is_available !== false;

	return (
		<div
			className={cn(
				"group relative flex gap-3 rounded-xl bg-card p-3 shadow-sm transition-all duration-200",
				"hover:shadow-md border border-border/50",
				!isAvailable && "opacity-50",
			)}
		>
			{/* Image */}
			{item.image_url && (
				<div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
					<img
						src={item.image_url}
						alt={item.name}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
					{!isAvailable && (
						<div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
							<span className="text-xs font-medium text-background">
								Unavailable
							</span>
						</div>
					)}
				</div>
			)}

			{/* Content */}
			<div className="flex flex-1 flex-col justify-between min-w-0">
				<div>
					<h3 className="font-semibold text-foreground leading-tight truncate">
						{item.name}
					</h3>
					{item.description && (
						<p className="mt-1 text-xs text-muted-foreground line-clamp-2">
							{item.description}
						</p>
					)}
				</div>

				<div className="flex items-center justify-between mt-2">
					<span className="text-lg font-bold text-primary">
						{formatPrice(item.price)}
					</span>

					{isAvailable && (
						<div className="flex items-center gap-2">
							{quantity > 0 ? (
								<>
									<Button
										size="icon"
										variant="outline"
										className="h-8 w-8 rounded-full"
										onClick={() => onRemove(item.id)}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<span className="w-6 text-center font-semibold">
										{quantity}
									</span>
									<Button
										size="icon"
										className="h-8 w-8 rounded-full"
										onClick={() => onAdd(item)}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</>
							) : (
								<Button
									size="sm"
									className="rounded-full px-4"
									onClick={() => onAdd(item)}
								>
									<Plus className="mr-1 h-4 w-4" />
									Add
								</Button>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
