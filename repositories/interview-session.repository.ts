import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

class InterviewSessionRepository {
  async create(data: Prisma.InterviewSessionCreateInput) {
    return prisma.interviewSession.create({
      data,
    });
  }

  async findByInterview(interviewId: string) {
    return prisma.interviewSession.findFirst({
      where: {
        interviewId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async update(id: string, data: Prisma.InterviewSessionUpdateInput) {
    return prisma.interviewSession.update({
      where: {
        id,
      },
      data,
    });
  }
}

export default new InterviewSessionRepository();