import { NextRequest, NextResponse } from "next/server";
import interviewService from "@/services/interview-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { interviewId } = body;

    if (!interviewId) {
      return NextResponse.json(
        {
          success: false,
          message: "Interview ID is required.",
        },
        { status: 400 }
      );
    }

    const result = await interviewService.startSession(interviewId);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate start interview question.",
      },
      {
        status: 500,
      }
    );
  }
}

