import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { validateToken } from "@/lib/token";
import { VerificationTokenType } from "@/app/generated/prisma/enums";

const tokenSchema = z.object({
  token: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const tokenParam = req.nextUrl.searchParams.get("token");
  const result = tokenSchema.safeParse({ token: tokenParam });

  if (!result.success) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const verificationToken = await validateToken(
    result.data.token,
    VerificationTokenType.PASSWORD_RESET
  );

  return NextResponse.json({ valid: !!verificationToken });
}
