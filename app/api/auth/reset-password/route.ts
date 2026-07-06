import { NextRequest } from "next/server";

import { ResetPasswordSchema } from "@/lib/validations/auth";
import { success, failure } from "@/lib/api/response";
import authService from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = ResetPasswordSchema.safeParse(body);

    if (!result.success) {
      return failure("Invalid request.", 422);
    }

    const { token, password } = result.data;
    const outcome = await authService.resetPassword(token, password);

    if (!outcome.ok) {
      return failure(outcome.error, outcome.status);
    }

    return success("Password updated successfully.");
  } catch (error) {
    console.error("Reset password error:", error);
    return failure("Internal server error.", 500);
  }
}
