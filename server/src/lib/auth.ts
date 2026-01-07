import { env } from "@server/env";
import type { JWTPayload } from "@server/types";
import bcrypt from "bcryptjs";
import { createMiddleware } from "hono/factory";
import { sign, verify } from "hono/jwt";

type Env = {
	Bindings: {
		JWT_SECRET: string;
	};
	Variables: {
		user: JWTPayload;
	};
};

export const generateToken = async (
	userId: string,
	email: string,
	secret: string,
): Promise<string> => {
	const payload = {
		userId,
		email,
		exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
	};

	return await sign(payload, secret);
};

export const hashPassword = async (password: string): Promise<string> => {
	const salt = bcrypt.genSaltSync(10);
	return await bcrypt.hashSync(password, salt);
};

export const comparePassword = async (
	password: string,
	hash: string,
): Promise<boolean> => {
	return await bcrypt.compareSync(password, hash);
};

export const authenticateToken = createMiddleware<Env>(async (c, next) => {
	const authHeader = c.req.header("authorization");
	const token = authHeader?.split(" ")[1];

	if (!token) {
		if (env.NODE_ENV === "development") {
			return await next();
		}
		return c.json({ error: "Access token required" }, 401);
	}

	try {
		const payload = (await verify(
			token,
			env.JWT_SECRET,
		)) as unknown as JWTPayload;
		c.set("user", payload);
		await next();
	} catch {
		return c.json({ error: "Invalid token" }, 403);
	}
});
