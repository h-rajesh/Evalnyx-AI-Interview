import { requireUser } from "@/lib/auth-user";
import { UpdateProfileSchema } from "@/lib/validations/profile";
import userService from "@/services/user.service";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest){
    try {
        const user = await requireUser(req);

        const profile = await userService.getProfile(user.id);

        return NextResponse.json({
            success:true,
            data : profile
        })
    } catch (error) {
        console.error("[GET /api/user/profile] Error:", error);
        return NextResponse.json(
            {
                success : false,
                message : error instanceof Error ? error.message : "Unauthorized"
            },{
                status : 401
            }
        )
    }
}

export async function PATCH(req:NextRequest) {
    try {
        const user = await requireUser(req);

        const body = await req.json();

        const result = UpdateProfileSchema.safeParse(body);
        if(!result.success){
            return NextResponse.json(
                {
                    success : false,
                    mesaage : result.error.issues[0].message,
                },{
                    status : 401
                }
            )
        }

        const profile = await userService.updateProfile(
            user.id,
            result.data
        );
        return NextResponse.json({
            success : true,
            data : profile
        })
    } catch (error) {
        console.error("[PATCH /api/user/profile] Error:", error);
        return NextResponse.json(
            {
                success : false,
                message : error instanceof Error ? error.message : "Unauthorized",
            },
            {
                status : 401
            }
        )
    }
}