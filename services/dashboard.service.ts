import prisma from "@/lib/prisma";

class DashboardService {
  async getDashboard() {
    const interviews = await prisma.interview.findMany({
      include: {
        report: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const reports = interviews
      .filter((i) => i.report)
      .map((i) => i.report!);

    const interviewCount = reports.length;

    if (interviewCount === 0) {
      return {
        interviewCount: 0,
        averageScore: 0,
        practiceHours: 0,
        confidence: 0,
        strongestSkill: "N/A",
        weakestSkill: "N/A",
        recentInterviews: [],
        performance: [],
        recommendations: [],
      };
    }

    const averageScore =
      Math.round(
        reports.reduce(
          (sum, r) => sum + r.overallScore,
          0
        ) / interviewCount
      );

    const confidence =
      Math.round(
        reports.reduce(
          (sum, r) => sum + r.confidenceScore,
          0
        ) / interviewCount
      );

    const technical =
      Math.round(
        reports.reduce(
          (sum, r) => sum + r.technicalScore,
          0
        ) / interviewCount
      );

    const communication =
      Math.round(
        reports.reduce(
          (sum, r) => sum + r.communicationScore,
          0
        ) / interviewCount
      );

    const behavior =
      Math.round(
        reports.reduce(
          (sum, r) => sum + r.behaviorScore,
          0
        ) / interviewCount
      );

    const integrity =
      Math.round(
        reports.reduce(
          (sum, r) => sum + r.integrityScore,
          0
        ) / interviewCount
      );

    const voice =
      Math.round(
        reports.reduce(
          (sum, r) => sum + r.voiceScore,
          0
        ) / interviewCount
      );

    const practiceMinutes =
      interviews.reduce(
        (sum, interview) =>
          sum + interview.duration,
        0
      );

    const practiceHours =
      Number(
        (practiceMinutes / 60).toFixed(1)
      );

    const performance =
      interviews
        .filter((i) => i.report)
        .map((i) => ({
          date: i.createdAt,
          score: i.report!.overallScore,
        }));

    const recentInterviews =
      interviews
        .filter((i) => i.report)
        .slice(-5)
        .reverse();

    const skills = [
      {
        name: "Technical",
        score: technical,
      },
      {
        name: "Communication",
        score: communication,
      },
      {
        name: "Behavior",
        score: behavior,
      },
      {
        name: "Confidence",
        score: confidence,
      },
      {
        name: "Integrity",
        score: integrity,
      },
      {
        name: "Voice",
        score: voice,
      },
    ];

    skills.sort(
      (a, b) => b.score - a.score
    );

    const strongestSkill = skills[0];

    const weakestSkill =
      skills[skills.length - 1];

    const recommendations = [];

    if (technical < 70)
      recommendations.push(
        "Practice more technical interview questions."
      );

    if (communication < 70)
      recommendations.push(
        "Improve communication clarity."
      );

    if (confidence < 70)
      recommendations.push(
        "Maintain better eye contact and reduce hesitation."
      );

    if (voice < 70)
      recommendations.push(
        "Speak louder and reduce filler words."
      );

    if (behavior < 70)
      recommendations.push(
        "Improve posture and maintain attention."
      );

    return {
      interviewCount,
      averageScore,
      practiceHours,
      confidence,
      strongestSkill,
      weakestSkill,
      technical,
      communication,
      behavior,
      integrity,
      voice,
      recentInterviews,
      performance,
      recommendations,
    };
  }
}

export default new DashboardService();