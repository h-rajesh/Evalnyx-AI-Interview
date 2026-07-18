import { requireUser } from "@/lib/auth-user";
import interviewService from "@/services/interview-service";
import { NextRequest, NextResponse } from "next/server";
import eventBus from "@/services/events/event-bus.service";
import { InterviewEvent } from "@/services/events/event-types";

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

        if (body.status === "COMPLETED") {
            await eventBus.publish({
                id: `ev_comp_${id}_${Date.now()}`,
                type: InterviewEvent.INTERVIEW_COMPLETED,
                interviewId: id,
                timestamp: new Date(),
                payload: {},
            });
        }

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