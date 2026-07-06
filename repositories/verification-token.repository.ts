import prisma from "@/lib/prisma";
import { VerificationTokenType } from "@/app/generated/prisma/enums";

class VerificationTokenRepository {
  async create(data: {
    token: string;
    userId: string;
    type: VerificationTokenType;
    expiresAt: Date;
  }) {
    return prisma.verificationToken.create({
      data,
    });
  }

  async find(
    token: string,
    type: VerificationTokenType
  ) {
    return prisma.verificationToken.findFirst({
      where: {
        token,
        type,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
  }

  async delete(token: string) {
    return prisma.verificationToken.deleteMany({
      where: {
        token,
      },
    });
  }

  async deleteExpired() {
    return prisma.verificationToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  async deleteByUser(
    userId: string,
    type: VerificationTokenType
  ) {
    return prisma.verificationToken.deleteMany({
      where: {
        userId,
        type,
      },
    });
  }

  async countRecent(
    userId: string,
    type: VerificationTokenType,
    after: Date
  ) {
    return prisma.verificationToken.count({
      where: {
        userId,
        type,
        createdAt: {
          gt: after,
        },
      },
    });
  }
}

export default new VerificationTokenRepository();