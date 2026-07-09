import prisma from "@/lib/prisma";
import { gemini } from "@/lib/ai/gemini";
import reportPromptService from "./report-prompt.service";

class ReportGeneratorService {
  async generate(interviewId: string) {
    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
      },
      include: {
        evaluations: true,
        behaviorSnapshots: true,
        integrityEvents: true,
        report: true,
      },
    });

    if (!interview || !interview.report) {
      throw new Error("Interview report not found");
    }

    const prompt = reportPromptService.build({
      interview,
      evaluations: interview.evaluations,
      snapshots: interview.behaviorSnapshots,
      integrityEvents: interview.integrityEvents,
      report: interview.report,
    });

    const response =
      await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

    const text = response.text ?? "";

    const ai = JSON.parse(text);

    await prisma.interviewReport.update({
      where: {
        interviewId,
      },
      data: {
        summary: ai.summary,
        strengths: ai.strengths,
        weaknesses: ai.weaknesses,
        recommendation: ai.recommendation,
        improvementPlan: ai.improvementPlan,
      },
    });

    return ai;
  }
}

export default new ReportGeneratorService();