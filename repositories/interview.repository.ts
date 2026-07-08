import prisma from "@/lib/prisma";
import { Interview, Prisma } from "@/app/generated/prisma/client";

class InterviewRepository {
  async create(data: Prisma.InterviewCreateInput): Promise<Interview> {
    return prisma.interview.create({
      data,
    });
  }

  async findById(id: string): Promise<Interview | null> {
    return prisma.interview.findUnique({
      where: { id },
    });
  }

  async findByUser(userId: string): Promise<Interview[]> {
    return prisma.interview.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async update(
    id: string,
    data: Prisma.InterviewUpdateInput
  ): Promise<Interview> {
    return prisma.interview.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Interview> {
    return prisma.interview.delete({
      where: { id },
    });
  }

  async updateCompletedTopics(
  id: string,
  topics: string[]
) {
  return prisma.interview.update({
    where: {
      id,
    },
    data: {
      completedTopics: topics,
    },
  });
}

async incrementQuestion(id: string) {
  const interview = await prisma.interview.findUnique({
    where: { id },
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  return prisma.interview.update({
    where: {
      id,
    },
    data: {
      currentQuestion: interview.currentQuestion + 1,
    },
  });
}
}

export default new InterviewRepository();