import { z } from "zod";

export const loginSchema = z.object({
	email: z.email("Email inválido"),
	password: z.string().min(1, "Senha é obrigatória"),
});

export const registerSchema = z.object({
	name: z.string().min(1, "Nome é obrigatório"),
	email: z.email("Email inválido"),
	password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});
