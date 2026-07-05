import { VerificationTokenType } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { deleteToken, validateToken } from "@/lib/token";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req : NextRequest) {
    try {
        const token = req.nextUrl.searchParams.get("token");

        if(!token){
            return NextResponse.redirect(
                new URL("/auth/signin?error=missing-token", req.url)
            )
        }

        const verificationToken = await validateToken(
            token,
            VerificationTokenType.EMAIL_VERIFICATION
        );
        if(!verificationToken){
            return NextResponse.redirect(
                new URL("/auth/signin?error=invalid-token", req.url)
            )
        }

        await prisma.user.update({
            where:{
                id : verificationToken.userId,
            },
            data:{
                emailVerified : new Date()
            }
        })

        await deleteToken(token);

        return NextResponse.redirect(
            new URL("/dashboard", req.url)
        );
    } catch (error) {
        console.error("Verify Email Error:",error);

        return NextResponse.redirect(
            new URL("/auth/signin?error=server-error", req.url)
        )
    }
}