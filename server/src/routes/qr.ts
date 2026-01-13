import {
	buildOrderQrUrl,
	buildTableQrUrl,
	parseQrSvgSize,
	toQrSvg,
} from "@server/lib/qr";
import { Hono } from "hono";

export const qrRoutes = new Hono()
	.get("/table/:qr_code.svg", async (c) => {
		const qrCode = c.req.param("qr_code") ?? c.req.param("qr_code.svg");
		if (!qrCode || qrCode.length > 200) {
			return c.json({ success: false, error: "Invalid QR code" }, 400);
		}

		const size = parseQrSvgSize(c.req.query("size"));
		const svg = await toQrSvg(buildTableQrUrl(qrCode), { width: size });

		c.header("Content-Type", "image/svg+xml; charset=utf-8");
		c.header("Cache-Control", "public, max-age=3600");
		return c.body(svg);
	})
	.get("/order/:qr_code.svg", async (c) => {
		const qrCode = c.req.param("qr_code") ?? c.req.param("qr_code.svg");
		if (!qrCode || qrCode.length > 200) {
			return c.json({ success: false, error: "Invalid QR code" }, 400);
		}

		const size = parseQrSvgSize(c.req.query("size"));
		const svg = await toQrSvg(buildOrderQrUrl(qrCode), { width: size });

		c.header("Content-Type", "image/svg+xml; charset=utf-8");
		c.header("Cache-Control", "no-store");
		return c.body(svg);
	});
