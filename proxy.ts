import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;

    if (
      token &&
      !token.emailVerified &&
      req.nextUrl.pathname !== "/verify-email-notice"
    ) {
      return NextResponse.redirect(
        new URL("/verify-email-notice", req.url)
      );
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/interview/:path*",
  ],
};
