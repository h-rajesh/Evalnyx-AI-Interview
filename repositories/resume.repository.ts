import prisma from "@/lib/prisma";
import { Prisma, Resume } from "../app/generated/prisma/client";

class ResumeRepository {
  async create(data: Prisma.ResumeCreateInput): Promise<Resume> {
    return prisma.resume.create({
      data,
    });
  }

  async findById(id: string): Promise<Resume | null> {
    return prisma.resume.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string) {
    return prisma.resume.findFirst({
      where: { userId },
      include: {
        parsedResume: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async update(
    id: string,
    data: Prisma.ResumeUpdateInput
  ) {
    return prisma.resume.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.resume.delete({
      where: { id },
    });
  }

  async deleteByUser(userId: string) {
    return prisma.resume.deleteMany({
      where: {
        userId,
      },
    });
  }

  async listByUser(userId: string) {
    return prisma.resume.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export default new ResumeRepository();