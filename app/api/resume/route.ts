import { requireUser } from "@/lib/auth-user";
import resumeService from "@/services/resume.service";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // 60 seconds max duration for file upload processing



export async function GET(req: NextRequest){
    try {
        const user = await requireUser(req);
        const resume = await resumeService.getResume(user.id);

        return NextResponse.json({
            success : true,
            data : resume,
        },{
            status : 200,
        })
    } catch (error) {
        return NextResponse.json(
            {
                success : false,
                message : "Unauthorized"
            },{
                status : 401,
            }
        )
    }
}

export async function POST(req: NextRequest){
    try {
        const user = await requireUser(req);

        const formData = await req.formData();

        const file = formData.get("file") as File;

        if(!file){
            return NextResponse.json(
                {
                    success : false,
                    message : "Resume file is required"
                },
                {
                    status : 400
                }
            )
        }

        if(file.type != "application/pdf"){
            return NextResponse.json(
                {
                    success : false,
                    message : "Only PDF files are allowed."
                },
                {status : 400}
            )
        }

        if(file.size > 5*1024*1024){
            return NextResponse.json(
                {
                    success : false,
                    message : "Resume must be smaller than 5MB."
                },
                {
                    status : 400
                }
            )
        }

        const bytes = await file.arrayBuffer();

        const buffer = Buffer.from(bytes);
         const resume = await resumeService.uploadResume(user.id, {
      buffer,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });

    return NextResponse.json({
      success: true,
      data: resume,
    });
    } catch (error) {
        console.error("[POST /api/resume] Error:", error);
        return NextResponse.json(
            {
                success : false,
                message : "Failed to upload resume.",
                detail: error instanceof Error ? error.message : String(error),
            },
            { 
                status : 500
            }
        )
    }
}
export async function DELETE(req: NextRequest){
    try {
        const user = await requireUser(req);

        await resumeService.deleteResume(user.id);

        return NextResponse.json({
            success : true,
            message : "Resume deleted successfully. "
        })
    } catch (error) {
        return NextResponse.json(
            {
                success : false,
                message : "Failed to delete resume."
            },
            {
                status : 500
            }
        )
    }
}