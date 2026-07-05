import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";
import { resendLimiter } from "@/lib/ratelimit";
import { VerificationTokenType } from "@/app/generated/prisma/enums";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "A valid email address is required." },
        { status: 422 }
      );
    }

    const normalizedEmail = result.data.email.toLowerCase().trim();


    // Rate limit keyed on the normalised email address
    const { success, remaining, reset } = await resendLimiter.limit(
      normalizedEmail
    );

    if (!success) {
      const retryAfterSec = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          message: "Too many requests. Please try again later.",
          retryAfter: retryAfterSec,
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

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Return 200 even if not found to avoid leaking account existence
    if (!user) {
      return NextResponse.json(
        { message: "If that email exists, a verification link has been sent." },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "This email is already verified. Please sign in." },
        { status: 400 }
      );
    }

    const verificationToken = await generateVerificationToken(
      user.id,
      VerificationTokenType.EMAIL_VERIFICATION
    );

    await sendVerificationEmail(user.email, verificationToken.token);

    return NextResponse.json(
      {
        message: "Verification email sent! Please check your inbox.",
        remaining,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend Verification Error:", error);

    return NextResponse.json(
      { message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
