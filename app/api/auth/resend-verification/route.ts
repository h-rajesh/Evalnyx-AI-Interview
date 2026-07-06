import { NextRequest } from "next/server";
import { z } from "zod";

import { success, failure } from "@/lib/api/response";
import { resendLimiter } from "@/lib/ratelimit";
import authService from "@/services/auth.service";

const schema = z.object({
  email: z.string().email(),
});

const SAFE_MESSAGE = "If that email exists, a verification link has been sent.";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return failure("A valid email address is required.", 422);
    }

    const normalizedEmail = result.data.email.toLowerCase().trim();

    // Rate limit keyed on the normalised email address
    const { success: allowed, remaining, reset } = await resendLimiter.limit(
      normalizedEmail
    );

    if (!allowed) {
      const retryAfterSec = Math.ceil((reset - Date.now()) / 1000);
      return new Response(
        JSON.stringify({ success: false, message: "Too many requests. Please try again later.", retryAfter: retryAfterSec }),
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

    const outcome = await authService.resendVerificationByEmail(normalizedEmail);

    if (!outcome.ok) {
      return failure(outcome.error, outcome.status);
    }

    return success(SAFE_MESSAGE);
  } catch (error) {
    console.error("Resend Verification Error:", error);
    return failure("Internal Server Error.", 500);
  }
}
