import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth-user";
import InterviewService from "@/services/interview-service";
import LiveKitService from "@/services/livekit.service";
import { InterviewStatus } from "@/app/generated/prisma/enums";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  req: Request,
  { params }: RouteParams
) {
  try {
    const user = await requireUser();

    const { id } = await params;

    const interview = await InterviewService.getInterview(id);

    if (!interview) {
      return NextResponse.json(
        {
          success: false,
          message: "Interview not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (interview.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 403,
        }
      );
    }

    if (interview.status !== InterviewStatus.READY && interview.status !== InterviewStatus.IN_PROGRESS) {
      return NextResponse.json(
        {
          success: false,
          message: `Interview cannot be started because it is ${interview.status}.`,
        },
        {
          status: 400,
        }
      );
    }

    await InterviewService.startInterview(id);

    const livekit =
      await LiveKitService.createInterviewSession(
        interview.id,
        user.id
      );

    return NextResponse.json({
      success: true,
      message: "Interview started successfully.",
      data: livekit,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to start interview.",
      },
      {
        status: 500,
      }
    );
  }
}