import { cn } from "@/lib/utils";

type Category = {
	id: number;
	name: string;
	description?: string | null;
};

interface CategoryTabsProps {
	categories: Category[];
	activeCategory: string | undefined;
	onCategoryChange: (categoryId: string) => void;
	isLoading?: boolean;
}

export function CategoryTabs({
	categories,
	activeCategory,
	onCategoryChange,
	isLoading,
}: CategoryTabsProps) {
	if (isLoading) {
		return (
			<div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-3">
				<div className="flex gap-2 overflow-x-auto pb-2">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-10 w-24 animate-pulse rounded-full bg-muted"
						/>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-3">
			<div
				className={cn(
					"flex gap-2 overflow-x-auto pb-2",
					"[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
				)}
			>
				{categories.map((category) => (
					<button
						key={category.id}
						type="button"
						onClick={() => onCategoryChange(String(category.id))}
						className={cn(
							"flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
							activeCategory === String(category.id)
								? "bg-primary text-primary-foreground shadow-md"
								: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
						)}
					>
						<span>{category.name}</span>
					</button>
				))}
			</div>
		</div>
	);
}
