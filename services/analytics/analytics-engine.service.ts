import prisma from "@/lib/prisma";

import technicalScoreService from "./technical-score.service";
import communicationScoreService from "./communication-score.service";
import confidenceScoreService from "./confidence-score.service";
import behaviorScoreService from "./behavior-score.service";
import integrityScoreService from "./integrity-score.service";
import voiceScoreService from "./voice-score.service";
import overallScoreService from "./overall-score.service";

class AnalyticsEngine {
  async generateReport(
    interviewId: string
  ) {
    const interview =
      await prisma.interview.findUnique({
        where: {
          id: interviewId,
        },

        include: {
          evaluations: true,

          behaviorSnapshots: true,

          integrityEvents: true,
        },
      });

    if (!interview)
      throw new Error(
        "Interview not found"
      );

    const technical =
      technicalScoreService.calculate(
        interview.evaluations
      );

    const communication =
      communicationScoreService.calculate(
        interview.evaluations
      );

    const confidence =
      confidenceScoreService.calculate(
        interview.evaluations
      );

    const behavior =
      behaviorScoreService.calculate(
        interview.behaviorSnapshots
      );

    const integrity =
      integrityScoreService.calculate(
        interview.integrityEvents
      );

    const voice =
      voiceScoreService.calculate(
        interview.behaviorSnapshots
      );

    const overall =
      overallScoreService.calculate({
        technical,

        communication,

        confidence,

        behavior,

        integrity,

        voice,
      });

    await prisma.interviewReport.upsert({
      where: {
        interviewId,
      },

      update: {
        overallScore: overall,

        technicalScore:
          technical,

        communicationScore:
          communication,

        confidenceScore:
          confidence,

        behaviorScore:
          behavior,

        integrityScore:
          integrity,

        voiceScore:
          voice,

        recommendation:
          overall >= 80
            ? "Strong Hire"
            : overall >= 65
            ? "Hire"
            : overall >= 50
            ? "Consider"
            : "Reject",
      },

      create: {
        interviewId,

        overallScore:
          overall,

        technicalScore:
          technical,

        communicationScore:
          communication,

        confidenceScore:
          confidence,

        behaviorScore:
          behavior,

        integrityScore:
          integrity,

        voiceScore:
          voice,

        recommendation:
          overall >= 80
            ? "Strong Hire"
            : overall >= 65
            ? "Hire"
            : overall >= 50
            ? "Consider"
            : "Reject",
      },
    });

    return overall;
  }
}

export default new AnalyticsEngine();