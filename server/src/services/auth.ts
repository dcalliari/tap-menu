import { db } from "@server/db";
import { usersInTapMenu } from "@server/db/schema";
import { env } from "@server/env";
import { comparePassword, generateToken, hashPassword } from "@server/lib/auth";
import { eq } from "drizzle-orm";

export async function login(input: { email: string; password: string }) {
	const [user] = await db
		.select()
		.from(usersInTapMenu)
		.where(eq(usersInTapMenu.email, input.email))
		.limit(1);

	if (!user) return { error: "Invalid email or password" as const };

	const isValidPassword = await comparePassword(
		input.password,
		user.password_hash,
	);
	if (!isValidPassword) return { error: "Invalid email or password" as const };

	const token = await generateToken(user.name, user.email, env.JWT_SECRET);
	const { password_hash, ...userWithoutPassword } = user;

	return { user: userWithoutPassword, token };
}

export async function register(input: {
	name: string;
	email: string;
	password: string;
}) {
	const [existingUser] = await db
		.select()
		.from(usersInTapMenu)
		.where(eq(usersInTapMenu.email, input.email))
		.limit(1);

	if (existingUser) return { error: "Email already registered" as const };

	const passwordHash = await hashPassword(input.password);

	const newUser = {
		name: input.name,
		email: input.email,
		password_hash: passwordHash,
	};

	await db.insert(usersInTapMenu).values(newUser);

	const token = await generateToken(
		newUser.name,
		newUser.email,
		env.JWT_SECRET,
	);
	const { password_hash, ...userWithoutPassword } = newUser;

	return { user: userWithoutPassword, token };
}
