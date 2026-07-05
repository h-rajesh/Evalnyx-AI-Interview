import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";
import { resendLimiter } from "@/lib/ratelimit";
import { VerificationTokenType } from "@/app/generated/prisma/enums";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  // Rate limit keyed on the user's DB ID — accurate and cannot be spoofed
  const { success, remaining, reset } = await resendLimiter.limit(
    session.user.id
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
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json(
      { message: "User not found." },
      { status: 404 }
    );
  }

  if (user.emailVerified) {
    return NextResponse.json(
      { message: "Email already verified." },
      { status: 400 }
    );
  }

  const token = await generateVerificationToken(
    user.id,
    VerificationTokenType.EMAIL_VERIFICATION
  );

  await sendVerificationEmail(user.email, token.token);

  return NextResponse.json(
    {
      message: "Verification email sent successfully.",
      remaining,
    },
    { status: 200 }
  );
}