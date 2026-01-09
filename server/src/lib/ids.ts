export function generateQrCode(prefix: string): string {
	// Needs to be URL/QR friendly and unique enough for typical usage.
	// crypto.randomUUID() is available in Bun and modern Node runtimes.
	return `${prefix}_${crypto.randomUUID()}`;
}
