import prisma from "@/lib/prisma";

interface CreateTimelineEvent {
  interviewId: string;
  timestamp: number;
  type: string;
  data?: any;
}

class TimelineService {
  async create(event: CreateTimelineEvent) {
    return prisma.interviewTimelineEvent.create({
      data: {
        interviewId: event.interviewId,
        timestamp: event.timestamp,
        type: event.type,
        data: event.data,
      },
    });
  }

  async get(interviewId: string) {
    return prisma.interviewTimelineEvent.findMany({
      where: {
        interviewId,
      },
      orderBy: {
        timestamp: "asc",
      },
    });
  }
}

export default new TimelineService();