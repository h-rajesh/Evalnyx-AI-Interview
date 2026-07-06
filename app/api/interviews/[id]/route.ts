import { requireUser } from "@/lib/auth-user";
import interviewService from "@/services/interview.service";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(
    req: NextRequest,
    { params }: { params: Params }
) {
    try {
        await requireUser();

        const { id } = await params;

        const interview = await interviewService.getInterview(id);

        return NextResponse.json({
            success: true,
            data: interview,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Interview not found",
            },
            { status: 404 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Params }
) {
    try {
        await requireUser();

        const { id } = await params;
        const body = await req.json();

        const updated = await interviewService.updateInterview(id, body);

        return NextResponse.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update interview",
            },
            { status: 400 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Params }
) {
    try {
        await requireUser();

        const { id } = await params;

        await interviewService.deleteInterview(id);

        return NextResponse.json({
            success: true,
            message: "Interview deleted successfully",
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete interview",
            },
            { status: 400 }
        );
    }
}