export interface JWTPayload {
	userId: string;
	email: string;
	exp: number;
}
