import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "@server/schemas/auth";
import { login, register } from "@server/services/auth";
import { Hono } from "hono";
import type { Bindings, Variables } from "hono/types";

export const authRoutes = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>()

	.post("/login", zValidator("json", loginSchema), async (c) => {
		try {
			const { email, password } = c.req.valid("json");
			const result = await login({ email, password });
			if ("error" in result) {
				return c.json({ error: result.error }, 401);
			}
			return c.json(result);
		} catch (error) {
			console.error("Login error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})

	.post("/register", zValidator("json", registerSchema), async (c) => {
		try {
			const { name, email, password } = c.req.valid("json");
			const result = await register({ name, email, password });
			if ("error" in result) {
				return c.json({ error: result.error }, 409);
			}
			return c.json(result, 201);
		} catch (error) {
			console.error("Registration error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	});
