import prisma from "@/lib/prisma";
import { Prisma, User } from "@/app/generated/prisma/client";

class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async getProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        headline: true,
        avatarUrl: true,
        phone: true,
        location: true,
        linkedinUrl: true,
        githubUrl: true,
        websiteUrl: true,
        experienceLevel: true,
        jobRole: true,
        yearsExperience: true,
        profileCompleted: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(
    userId: string,
    data: Prisma.UserUpdateInput
  ) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        headline: true,
        avatarUrl: true,
        phone: true,
        location: true,
        linkedinUrl: true,
        githubUrl: true,
        websiteUrl: true,
        experienceLevel: true,
        jobRole: true,
        yearsExperience: true,
        profileCompleted: true,
      },
    });
  }

  async updatePassword(
    id: string,
    hashedPassword: string
  ) {
    return prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });
  }

  async verifyEmail(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        emailVerified: new Date(),
      },
    });
  }

  async resetPasswordTransaction(
    userId: string,
    tokenId: string,
    hashedPassword: string
  ) {
    return prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({
        where: { id: tokenId },
      }),
    ]);
  }

  async deleteSessions(userId: string) {
    return prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  }
  async updateAvatar(userId: string, avatarUrl: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl,
      image: avatarUrl,
    },
  });
}
}

export default new UserRepository();