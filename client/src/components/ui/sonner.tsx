"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
	return (
		<Sonner
			className="toaster group"
			style={
				{
					"--normal-bg": "hsl(var(--background))",
					"--normal-text": "hsl(var(--foreground))",
					"--normal-border": "hsl(var(--border))",
					"--success-bg": "hsl(142.1 76.2% 36.3%)",
					"--success-text": "hsl(0 0% 100%)",
					"--success-border": "hsl(142.1 76.2% 36.3%)",
					"--error-bg": "hsl(var(--destructive))",
					"--error-text": "hsl(var(--destructive-foreground))",
					"--error-border": "hsl(var(--destructive))",
				} as React.CSSProperties
			}
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-[var(--normal-bg)] group-[.toaster]:text-[var(--normal-text)] group-[.toaster]:border-[var(--normal-border)] group-[.toaster]:shadow-lg",
					description: "group-[.toast]:text-muted-foreground",
					actionButton:
						"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
					cancelButton:
						"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
					success:
						"group-[.toaster]:bg-[var(--success-bg)] group-[.toaster]:text-[var(--success-text)] group-[.toaster]:border-[var(--success-border)]",
					error:
						"group-[.toaster]:bg-[var(--error-bg)] group-[.toaster]:text-[var(--error-text)] group-[.toaster]:border-[var(--error-border)]",
				},
			}}
			{...props}
		/>
	);
}

export { Toaster };
