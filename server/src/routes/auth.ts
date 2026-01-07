import { zValidator } from "@hono/zod-validator";
import { db } from "@server/db";
import { usersInTapMenu } from "@server/db/schema";
import { env } from "@server/env";
import { comparePassword, generateToken, hashPassword } from "@server/lib/auth";
import { loginSchema, registerSchema } from "@server/schemas/auth";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings, Variables } from "hono/types";

export const authRoutes = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>()

	.post("/login", zValidator("json", loginSchema), async (c) => {
		try {
			const { email, password } = c.req.valid("json");

			const [user] = await db
				.select()
				.from(usersInTapMenu)
				.where(eq(usersInTapMenu.email, email))
				.limit(1);

			if (!user) {
				return c.json({ error: "Invalid email or password" }, 401);
			}

			const isValidPassword = await comparePassword(
				password,
				user.password_hash,
			);

			if (!isValidPassword) {
				return c.json({ error: "Invalid email or password" }, 401);
			}

			const token = await generateToken(user.name, user.email, env.JWT_SECRET);

			const { password_hash, ...userWithoutPassword } = user;

			return c.json({ user: userWithoutPassword, token });
		} catch (error) {
			console.error("Login error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})

	.post("/register", zValidator("json", registerSchema), async (c) => {
		try {
			const { name, email, password } = c.req.valid("json");

			const [existingUser] = await db
				.select()
				.from(usersInTapMenu)
				.where(eq(usersInTapMenu.email, email))
				.limit(1);

			if (existingUser) {
				return c.json({ error: "Email already registered" }, 409);
			}

			const passwordHash = await hashPassword(password);

			const newUser = {
				name,
				email,
				password_hash: passwordHash,
			};

			await db.insert(usersInTapMenu).values(newUser);

			const token = await generateToken(
				newUser.name,
				newUser.email,
				env.JWT_SECRET,
			);

			const { password_hash, ...userWithoutPassword } = newUser;

			return c.json({ user: userWithoutPassword, token }, 201);
		} catch (error) {
			console.error("Registration error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	});
