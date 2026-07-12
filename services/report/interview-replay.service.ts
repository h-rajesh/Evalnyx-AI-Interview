import prisma from "@/lib/prisma";

class InterviewReplayService {
  async get(interviewId: string) {
    const [
      messages,
      evaluations,
      snapshots,
      integrity,
      timeline,
    ] = await Promise.all([
      prisma.interviewMessage.findMany({
        where: {
          interviewId,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.interviewEvaluation.findMany({
        where: {
          interviewId,
        },
        orderBy: {
          questionNumber: "asc",
        },
      }),

      prisma.behaviorSnapshot.findMany({
        where: {
          interviewId,
        },
        orderBy: {
          second: "asc",
        },
      }),

      prisma.integrityEvent.findMany({
        where: {
          interviewId,
        },
        orderBy: {
          second: "asc",
        },
      }),

      prisma.interviewTimelineEvent.findMany({
        where: {
          interviewId,
        },
        orderBy: {
          timestamp: "asc",
        },
      }),
    ]);

    return {
      messages,
      evaluations,
      snapshots,
      integrity,
      timeline,
    };
  }
}

export default new InterviewReplayService();
