import { z } from "zod";

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50),

  email: z.string().email(),

  password: z
    .string()
    .min(8)
    .max(100),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),

  password: z
    .string()
    .min(8)
    .max(100),
});