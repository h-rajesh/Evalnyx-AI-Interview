import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { success, failure } from "@/lib/api/response";
import { resendLimiter } from "@/lib/ratelimit";
import authService from "@/services/auth.service";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return failure("Unauthorized", 401);
    }

    // Rate limit keyed on the user's DB ID — cannot be spoofed
    const { success: allowed, remaining, reset } = await resendLimiter.limit(
      session.user.id
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

    const outcome = await authService.resendVerificationById(session.user.id);

    if (!outcome.ok) {
      return failure(outcome.error, outcome.status);
    }

    return success("Verification email sent successfully.", { remaining });
  } catch (error) {
    console.error("Resend Verification Error:", error);
    return failure("Internal Server Error.", 500);
  }
}