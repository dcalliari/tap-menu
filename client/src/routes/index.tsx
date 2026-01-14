import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const navigate = useNavigate();
	const auth = useAuth();

	const [tableQrCode, setTableQrCode] = useState("");
	const [orderQrCode, setOrderQrCode] = useState("");

	const cleanedTableQr = useMemo(() => tableQrCode.trim(), [tableQrCode]);
	const cleanedOrderQr = useMemo(() => orderQrCode.trim(), [orderQrCode]);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const tableQrCode = params.get("table_qr_code");
		if (tableQrCode) {
			void navigate({
				to: "/table/$tableQrCode",
				params: { tableQrCode },
				replace: true,
			});
			return;
		}

		const orderQrCode = params.get("order_qr_code");
		if (orderQrCode) {
			void navigate({
				to: "/order/$orderQrCode",
				params: { orderQrCode },
				replace: true,
			});
		}
	}, [navigate]);

	return (
		<div className="min-h-screen">
			<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
				<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-3xl font-semibold tracking-tight">Tap Menu</h1>
						<p className="text-muted-foreground text-sm">
							Scan a table QR code, place an order, and track it live.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						{auth.isAuthenticated ? (
							<>
								<Button variant="outline" asChild>
									<Link to="/admin">Admin</Link>
								</Button>
								<Button variant="outline" asChild>
									<Link to="/kitchen">Kitchen</Link>
								</Button>
								<Button variant="destructive" onClick={() => auth.logout()}>
									Logout
								</Button>
							</>
						) : (
							<>
								<Button variant="outline" asChild>
									<Link to="/login">Admin login</Link>
								</Button>
								<Button variant="outline" asChild>
									<Link to="/register">Register</Link>
								</Button>
							</>
						)}
					</div>
				</header>

				<section className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Order from your table</CardTitle>
							<CardDescription>
								Enter the table QR code (or scan it using your camera app).
							</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-3">
							<Input
								value={tableQrCode}
								onChange={(e) => setTableQrCode(e.target.value)}
								placeholder="table_qr_code"
								autoCapitalize="none"
								autoCorrect="off"
								autoComplete="off"
								spellCheck={false}
							/>
							<p className="text-muted-foreground text-xs">
								Tip: if your QR opens a URL like
								<span className="font-medium">/?table_qr_code=…</span>, you can
								paste just the code.
							</p>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								disabled={!cleanedTableQr}
								onClick={() =>
									navigate({
										to: "/table/$tableQrCode",
										params: { tableQrCode: cleanedTableQr },
									})
								}
							>
								View menu
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Track an existing order</CardTitle>
							<CardDescription>
								If you already placed an order, enter the order QR code.
							</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-3">
							<Input
								value={orderQrCode}
								onChange={(e) => setOrderQrCode(e.target.value)}
								placeholder="order_qr_code"
								autoCapitalize="none"
								autoCorrect="off"
								autoComplete="off"
								spellCheck={false}
							/>
							<p className="text-muted-foreground text-xs">
								Your status page refreshes automatically.
							</p>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								variant="secondary"
								disabled={!cleanedOrderQr}
								onClick={() =>
									navigate({
										to: "/order/$orderQrCode",
										params: { orderQrCode: cleanedOrderQr },
									})
								}
							>
								View order
							</Button>
						</CardFooter>
					</Card>
				</section>

				<section className="grid gap-2">
					<p className="text-muted-foreground text-sm">
						For staff: use <Link to="/admin">Admin</Link> to manage tables and
						menu, and <Link to="/kitchen">Kitchen</Link> for the live queue.
					</p>
				</section>
			</div>
		</div>
	);
}

export default Index;
