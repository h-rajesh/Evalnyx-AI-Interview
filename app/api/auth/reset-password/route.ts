import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { deleteToken, validateToken } from "@/lib/token";
import { ResetPasswordSchema } from "@/lib/validations/auth";
import { VerificationTokenType } from "@/app/generated/prisma/enums";

export async function POST(req: NextRequest) {
  try {
    // Zod validation
    const body = await req.json();
    const result = ResetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid request.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { token, password } = result.data;

    const verificationToken = await validateToken(
      token,
      VerificationTokenType.PASSWORD_RESET
    );

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Invalid or expired token." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      // Update password
      await tx.user.update({
        where: { id: verificationToken.userId },
        data: { password: hashedPassword },
      });

      // Consume the token so it cannot be reused
      await tx.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      // Invalidate all active sessions — forces re-login everywhere
      await tx.session.deleteMany({
        where: { userId: verificationToken.userId },
      });
    });

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
