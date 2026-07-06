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
}

export default new InterviewRepository();