import { Link } from "@tanstack/react-router";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "5xl";

const maxWidthClassName: Record<MaxWidth, string> = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-xl",
	"2xl": "max-w-2xl",
	"4xl": "max-w-4xl",
	"5xl": "max-w-5xl",
};

export function AppShell(props: {
	title: React.ReactNode;
	description?: React.ReactNode;
	maxWidth?: MaxWidth;
	showHomeLink?: boolean;
	titleClassName?: string;
	actions?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}) {
	const {
		title,
		description,
		maxWidth = "5xl",
		showHomeLink = true,
		titleClassName,
		actions,
		children,
		className,
	} = props;

	return (
		<div className="min-h-screen">
			<div
				className={cn(
					"mx-auto flex w-full flex-col gap-6 px-4 py-10",
					maxWidthClassName[maxWidth],
					className,
				)}
			>
				<header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0">
						<h1
							className={cn(
								"text-2xl font-semibold tracking-tight",
								titleClassName,
							)}
						>
							{title}
						</h1>
						{description ? (
							<p className="text-muted-foreground text-sm">{description}</p>
						) : null}
					</div>
					<div className="flex flex-wrap items-center gap-2">
						{showHomeLink ? (
							<Button variant="outline" asChild>
								<Link to="/">Home</Link>
							</Button>
						) : null}
						{actions}
					</div>
				</header>
				{children}
			</div>
		</div>
	);
}
