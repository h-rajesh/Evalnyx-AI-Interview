import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { VerificationTokenType } from "@/app/generated/prisma/enums";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";
import { RegisterSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    // Zod validation — replaces manual !name || !email || !password checks
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // User exists and is already verified — reject
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { message: "An account with this email already exists. Please sign in." },
          { status: 409 }
        );
      }

      // User exists but email is NOT verified (e.g. previous signup where email failed)
      // Resend the verification email so they can complete registration
      try {
        const verificationToken = await generateVerificationToken(
          existingUser.id,
          VerificationTokenType.EMAIL_VERIFICATION
        );
        await sendVerificationEmail(existingUser.email, verificationToken.token);
      } catch (emailError) {
        console.error("Resend verification email failed:", emailError);
        return NextResponse.json(
          {
            message:
              "Your account exists but we could not send a verification email. Please try again shortly.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message:
            "A verification email has been resent. Please check your inbox to activate your account.",
        },
        { status: 200 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
        },
      });
    });

    const verificationToken = await generateVerificationToken(
      user.id,
      VerificationTokenType.EMAIL_VERIFICATION
    );

    try {
      await sendVerificationEmail(user.email, verificationToken.token);
    } catch (emailError) {
      // User is created but email failed. They can use resend on the verify-email page.
      console.error("Verification email failed after signup:", emailError);
      return NextResponse.json(
        {
          message:
            "Account created, but we could not send a verification email. Please use the resend option on the next page.",
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Registration successful. Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);

    return NextResponse.json(
      { message: "Internal Server Error." },
      { status: 500 }
    );
  }
}