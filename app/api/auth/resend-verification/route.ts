import { VerificationTokenType } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { generateVerificationToken } from "@/lib/token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always return 200 to avoid leaking whether an email is registered
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
      { message: "Verification email sent! Please check your inbox." },
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
