import { requireUser } from "@/lib/auth-user";
import interviewService from "@/services/interview.service";
import { CreateInterviewSchema } from "@/validations/interview";
import { NextRequest, NextResponse } from "next/server";


export async function GET(){
    try {
        const user = await requireUser();

        const interviews = await interviewService.getInterviews(user.id);

        return NextResponse.json({
            success : true,
            data : interviews
        },{
            status : 200
        })
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                success : false,
                message : "Failed to fetch interviews"
            },
            {
                status : 500
            }
        )
    }
}

export async function POST(req : NextRequest){
    try {
        const user = await requireUser();
        
        const body = await req.json();

        const validated = CreateInterviewSchema.parse(body);

        const interview = await interviewService.createInterview(
            user.id,
            validated
        );
        return NextResponse.json(
            {
                success : true,
                data : interview
            },
            {
                status : 201
            }
        )
    } catch (error : any) {
        console.error(error.message)

        return NextResponse.json(
            {
                success : false,
                message : error.message ?? "Failed to create interview"
            },
            {
                status : 500
            }
        )
    }
}