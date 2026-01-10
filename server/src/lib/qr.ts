import { env } from "@server/env";
import QRCode from "qrcode";

export type QrSvgOptions = {
	width?: number;
	margin?: number;
};

export async function toQrSvg(text: string, options: QrSvgOptions = {}) {
	const width = options.width ?? 256;
	const margin = options.margin ?? 2;

	return await QRCode.toString(text, {
		type: "svg",
		errorCorrectionLevel: "M",
		width,
		margin,
	});
}

function buildFrontendUrl(params: Record<string, string>) {
	const url = new URL(env.FRONTEND_URL);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value);
	}
	return url.toString();
}

export function buildTableQrUrl(tableQrCode: string) {
	return buildFrontendUrl({ table_qr_code: tableQrCode });
}

export function buildOrderQrUrl(orderQrCode: string) {
	return buildFrontendUrl({ order_qr_code: orderQrCode });
}

export function parseQrSvgSize(value: string | undefined) {
	if (!value) return undefined;
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return undefined;
	const int = Math.floor(parsed);
	if (int < 128 || int > 1024) return undefined;
	return int;
}
