import { NextRequest } from "next/server";

import { RegisterSchema } from "@/lib/validations/auth";
import { success, failure } from "@/lib/api/response";
import authService from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return failure("Validation failed.", 422);
    }

    const outcome = await authService.register(result.data);

    if (!outcome.ok) {
      return failure(outcome.error, outcome.status);
    }

    const emailFailed = (outcome.data as { emailFailed?: boolean } | undefined)
      ?.emailFailed;

    return success(
      emailFailed
        ? "Account created, but we could not send a verification email. Please use the resend option on the next page."
        : "Registration successful. Please check your email to verify your account.",
      undefined,
      201
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return failure("Internal Server Error.", 500);
  }
}