import prisma from "@/lib/prisma";

class AIContextService {
  async getInterviewContext(interviewId: string) {
    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
      },
      include: {
        user: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!interview) {
      throw new Error("Interview not found");
    }

    const latestResume = await prisma.resume.findFirst({
      where: {
        userId: interview.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        parsedResume: true,
      },
    });

    return {
      interview,
      user: interview.user,
      resume: latestResume?.parsedResume ?? null,
      messages: interview.messages,
    };
  }
}

export default new AIContextService();