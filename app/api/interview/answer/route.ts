import { NextRequest, NextResponse } from "next/server";
import interviewService from "@/services/interview-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { interviewId, answer } = body;

    if (!interviewId) {
      return NextResponse.json(
        {
          success: false,
          message: "Interview ID is required.",
        },
        { status: 400 }
      );
    }

    if (!answer?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Answer is required.",
        },
        { status: 400 }
      );
    }

    const result = await interviewService.submitAnswer(interviewId, answer);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to evaluate answer and generate question.",
      },
      {
        status: 500,
      }
    );
  }
}

