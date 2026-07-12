import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import interviewReplayService from "@/services/report/interview-replay.service";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const report = await prisma.interviewReport.findUnique({
      where: {
        interviewId: id,
      },
      include: {
        interview: {
          include: {
            evaluations: {
              orderBy: {
                questionNumber: "asc",
              },
              select: {
                id: true,
                questionNumber: true,
                question: true,
                answer: true,
                technicalScore: true,
                communicationScore: true,
                confidenceScore: true,
                correctnessScore: true,
                feedback: true,
                strengths: true,
                weaknesses: true,
              },
            },

            behaviorSnapshots: {
              orderBy: {
                second: "asc",
              },
            },

            integrityEvents: {
              orderBy: {
                second: "asc",
              },
            },

            timelineEvents: {
              orderBy: {
                timestamp: "asc",
              },
            },
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          message: "Report not found",
        },
        {
          status: 404,
        }
      );
    }

    const replay = await interviewReplayService.get(id);

    const formattedReport = {
      ...report,
      interview: {
        ...report.interview,
        evaluations: report.interview.evaluations.map((evaluation) => ({
          ...evaluation,
          strengths: Array.isArray(evaluation.strengths)
            ? evaluation.strengths
            : [],
          weaknesses: Array.isArray(evaluation.weaknesses)
            ? evaluation.weaknesses
            : [],
        })),
      },
    };

    return NextResponse.json({
      success: true,
      report: formattedReport,
      replay,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load report",
      },
      {
        status: 500,
      }
    );
  }
}