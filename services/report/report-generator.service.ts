import prisma from "@/lib/prisma";
import roadmapGenerator from "./roadmap-generator.service";
import InterviewAIService from "../interview-ai.service";

import ReportPromptService from "./report-prompt.service";

class ReportGeneratorService {
  async generate(interviewId: string) {
    const report =
      await prisma.interviewReport.findUnique({
        where: {
          interviewId,
        },
      });

    if (!report)
      throw new Error("Report not found.");



    const evaluations =
      await prisma.interviewEvaluation.findMany({
        where: {
          interviewId,
        },
        orderBy: {
          questionNumber: "asc",
        },
      });

    const prompt =
      ReportPromptService.build(
        report,
        evaluations
      );

    const ai =
      await InterviewAIService.generateReport(
        prompt
      );

    const behavior = await prisma.behaviorSnapshot.findMany({
      where: {
        interviewId,
      },
    });

    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
      },
    });

    const roadmap = await roadmapGenerator.generate({
      report,
      evaluations,
      behavior,
      interview,
    });

    await prisma.interviewReport.update({
      where: {
        interviewId,
      },

      data: {
        summary: ai.summary,

        recommendation:
          ai.recommendation,

        strengths: ai.strengths,

        weaknesses:
          ai.weaknesses,

        learningRoadmap:
          roadmap.learningRoadmap,

        suggestedAnswers:
          roadmap.suggestedAnswers,

        careerAdvice:
          roadmap.careerAdvice,

        nextInterviewDifficulty:
          roadmap.nextInterviewDifficulty,
      },
    });
  }
}

export default new ReportGeneratorService();