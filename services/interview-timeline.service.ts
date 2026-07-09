import prisma from "@/lib/prisma";

interface TimelineInput {
  interviewId: string;

  timestamp: number;

  type: string;

  data?: any;
}

class InterviewTimelineService {
  async create(input: TimelineInput) {
    return prisma.interviewTimelineEvent.create({
      data: {
        interviewId: input.interviewId,
        timestamp: input.timestamp,
        type: input.type,
        data: input.data,
      },
    });
  }
}

export default new InterviewTimelineService();
