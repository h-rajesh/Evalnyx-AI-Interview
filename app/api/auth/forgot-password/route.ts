import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/token";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordLimiter } from "@/lib/ratelimit";
import { getIp } from "@/lib/getIp";
import { ForgotPasswordSchema } from "@/lib/validations/auth";
import { VerificationTokenType } from "@/app/generated/prisma/enums";

const SAFE_RESPONSE = {
  message:
    "If an account with that email exists, we've sent a password reset link.",
};

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP — prevents email flooding regardless of the address used
    const ip = getIp(req);
    const { success, remaining, reset } = await forgotPasswordLimiter.limit(ip);

    if (!success) {
      const retryAfterSec = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          message: `Too many requests. Please try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSec),
            "X-RateLimit-Remaining": String(remaining),
          },
        }
      );
    }

    // Zod validation
    const body = await req.json();
    const result = ForgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid email address.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { email } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always return the same response to avoid leaking account existence
    if (!user) {
      return NextResponse.json(SAFE_RESPONSE);
    }

    const token = await generateVerificationToken(
      user.id,
      VerificationTokenType.PASSWORD_RESET
    );

    await sendPasswordResetEmail(user.email, token.token);

    return NextResponse.json(SAFE_RESPONSE);
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
