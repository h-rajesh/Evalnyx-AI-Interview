import { NextRequest, NextResponse } from "next/server";
import interviewService from "@/services/interview.service";
import analyticsEngine from "@/services/analytics/analytics-engine.service";
import reportGeneratorService from "@/services/report/report-generator.service";
import { InterviewStatus } from "@/app/generated/prisma/enums";

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

    console.log(`Finishing interview session for ID: ${interviewId}`);

    // Update the interview status to COMPLETED
    await interviewService.updateInterview(interviewId, {
      status: InterviewStatus.COMPLETED,
    });

    // Run analytics and generate report
    await analyticsEngine.generateReport(interviewId);
    await reportGeneratorService.generate(interviewId);

    console.log(`Interview session finished and report generated for ID: ${interviewId}`);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to finalize the interview session and generate report.",
      },
      {
        status: 500,
      }
    );
  }
}
