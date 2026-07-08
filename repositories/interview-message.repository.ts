import prisma from "@/lib/prisma";
import { MessageRole } from "@/app/generated/prisma/enums";

class InterviewMessageRepository {
  async create(data: {
    interviewId: string;
    role: MessageRole;
    content: string;
  }) {
    return prisma.interviewMessage.create({
      data,
    });
  }

  async findByInterviewId(interviewId: string) {
    return prisma.interviewMessage.findMany({
      where: {
        interviewId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async deleteByInterviewId(interviewId: string) {
    return prisma.interviewMessage.deleteMany({
      where: {
        interviewId,
      },
    });
  }
}

export default new InterviewMessageRepository();