import { NextRequest, NextResponse } from "next/server";

import authService from "@/services/auth.service";
import { ROUTES } from "@/constants/routes";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL(`${ROUTES.AUTH.SIGN_IN}?error=missing-token`, req.url)
      );
    }

    const outcome = await authService.verifyEmail(token);

    if (!outcome.ok) {
      return NextResponse.redirect(
        new URL(`${ROUTES.AUTH.SIGN_IN}?error=${outcome.error}`, req.url)
      );
    }

    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.url));
  } catch (error) {
    console.error("Verify Email Error:", error);

    return NextResponse.redirect(
      new URL(`${ROUTES.AUTH.SIGN_IN}?error=server-error`, req.url)
    );
  }
}