import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import userRepository from "@/repositories/user.repository";

export async function requireUser(_req?: NextRequest) {
    const cookieStore = await cookies();

    // DEBUG — log all cookie names
    const allCookies = cookieStore.getAll();
    console.log("[requireUser] all cookies:", allCookies.map(c => c.name));

    const sessionToken =
        cookieStore.get("next-auth.session-token")?.value ??
        cookieStore.get("__Secure-next-auth.session-token")?.value;

    console.log("[requireUser] sessionToken found:", !!sessionToken);

    if (!sessionToken) {
        throw new Error("UNAUTHORIZED");
    }

    const token = await decode({
        token: sessionToken,
        secret: process.env.NEXTAUTH_SECRET!,
    });

    console.log("[requireUser] decoded token:", JSON.stringify(token));

    if (!token?.id) {
        throw new Error("UNAUTHORIZED");
    }

    const user = await userRepository.findById(token.id as string);

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    return user;
}