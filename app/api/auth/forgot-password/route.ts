import { NextRequest } from "next/server";

import { ForgotPasswordSchema } from "@/lib/validations/auth";
import { success, failure } from "@/lib/api/response";
import { forgotPasswordLimiter } from "@/lib/ratelimit";
import { getIp } from "@/lib/getIp";
import authService from "@/services/auth.service";

const SAFE_MESSAGE =
  "If an account with that email exists, we've sent a password reset link.";

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP before reading the body
    const ip = getIp(req);
    const { success: allowed, remaining, reset } = await forgotPasswordLimiter.limit(ip);

    if (!allowed) {
      const retryAfterSec = Math.ceil((reset - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Too many requests. Please try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfterSec),
            "X-RateLimit-Remaining": String(remaining),
          },
        }
      );
    }

    const body = await req.json();
    const result = ForgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return failure("Invalid email address.", 422);
    }

    // Service always returns ok regardless of whether the account exists
    await authService.forgotPassword(result.data.email);

    return success(SAFE_MESSAGE);
  } catch (error) {
    console.error("Forgot password error:", error);
    return failure("Internal server error.", 500);
  }
}
