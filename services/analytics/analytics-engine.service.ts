import prisma from "@/lib/prisma";

class AnalyticsEngine {
  async generateReport(interviewId: string) {
    // ----------------------------
    // Load Data
    // ----------------------------

    const [
      evaluations,
      behaviorSnapshots,
      integrityEvents,
    ] = await Promise.all([
      prisma.interviewEvaluation.findMany({
        where: {
          interviewId,
        },
      }),

      prisma.behaviorSnapshot.findMany({
        where: {
          interviewId,
        },
      }),

      prisma.integrityEvent.findMany({
        where: {
          interviewId,
        },
      }),
    ]);

    // ----------------------------
    // Technical Score
    // ----------------------------

    const technicalScore =
      this.average(
        evaluations.map(
          (e) => e.technicalScore
        )
      );

    // ----------------------------
    // Communication Score
    // ----------------------------

    const communicationScore =
      this.average(
        evaluations.map(
          (e) =>
            e.communicationScore
        )
      );

    // ----------------------------
    // Confidence Score
    // ----------------------------

    const confidenceScore =
      this.average(
        evaluations.map(
          (e) => e.confidenceScore
        )
      );

    // ----------------------------
    // Behavior Score
    // ----------------------------

    const behaviorScore =
      this.average(
        behaviorSnapshots.map(
          (b) => b.confidence
        )
      );

    // ----------------------------
    // Voice Score
    // ----------------------------

    const voiceScore =
      this.average(
        behaviorSnapshots.map(
          (b) => b.voiceVolume * 100
        )
      );

    // ----------------------------
    // Integrity Score
    // ----------------------------

    let integrityScore = 100;

    integrityEvents.forEach((event) => {
      integrityScore -=
        event.severity * 5;
    });

    integrityScore = Math.max(
      integrityScore,
      0
    );

    // ----------------------------
    // Overall
    // ----------------------------

    const overallScore =
      Number(
        (
          (
            technicalScore +
            communicationScore +
            confidenceScore +
            behaviorScore +
            integrityScore +
            voiceScore
          ) /
          6
        ).toFixed(1)
      );

    // ----------------------------
    // Save Report
    // ----------------------------

    await prisma.interviewReport.upsert({
      where: {
        interviewId,
      },

      update: {
        overallScore,
        technicalScore,
        communicationScore,
        confidenceScore,
        behaviorScore,
        integrityScore,
        voiceScore,
      },

      create: {
        interviewId,

        overallScore,

        technicalScore,

        communicationScore,

        confidenceScore,

        behaviorScore,

        integrityScore,

        voiceScore,

        recommendation: "",
      },
    });

    return {
      overallScore,
      technicalScore,
      communicationScore,
      confidenceScore,
      behaviorScore,
      integrityScore,
      voiceScore,
    };
  }

  private average(
    numbers: number[]
  ) {
    if (!numbers.length) return 0;

    return Number(
      (
        numbers.reduce(
          (a, b) => a + b,
          0
        ) / numbers.length
      ).toFixed(1)
    );
  }
}

export default new AnalyticsEngine();