import InterviewRepository from "@/repositories/interview.repository";
import ResumeRepository from "@/repositories/resume.repository";
import UserRepository from "@/repositories/user.repository";
import {
  InterviewStatus,
  interviewDifficulty,
} from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { InterviewUpdateInput } from "@/app/generated/prisma/models";

class InterviewService {
  async createInterview(
    userId: string,
    data: {
      title: string;
      jobRole: string;
      company?: string | null;
      description?: string | null;
      difficulty: any;
      duration: number;
    }
  ) {
    const user =
      await UserRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.profileCompleted) {
      throw new Error(
        "Complete your profile first."
      );
    }

    const resume =
      await ResumeRepository.findByUserId(userId);

    if (!resume) {
      throw new Error(
        "Upload your resume first."
      );
    }

    return InterviewRepository.create({
      user: {
        connect: {
          id: userId,
        },
      },

      title: data.title,
      jobRole: data.jobRole,
      company: data.company,

      description: data.description,

      difficulty: data.difficulty,

      duration: data.duration,

      status: InterviewStatus.READY,
    });
  }

  async getInterviews(userId: string) {
    return InterviewRepository.findByUser(userId);
  }

  async getInterview(id: string) {
    const interview = await InterviewRepository.findById(id);
    if (!interview) {
      throw new Error("Interview not found");
    }
    return interview;
  }

  async updateInterview(id: string, data: InterviewUpdateInput) {
    return InterviewRepository.update(id, data);
  }

  async deleteInterview(id: string) {
    return InterviewRepository.delete(id);
  }

  async findByIdAndUser(
  id: string,
  userId: string
) {
  return prisma.interview.findFirst({
    where: {
      id,
      userId,
    },
  });
}

async updateByIdAndUser(
  id: string,
  userId: string,
  data: InterviewUpdateInput
) {
  return prisma.interview.updateMany({
    where: {
      id,
      userId,
    },
    data,
  });
}

async deleteByIdAndUser(
  id: string,
  userId: string
) {
  return prisma.interview.deleteMany({
    where: {
      id,
      userId,
    },
  });
}
async startInterview(id: string) {
  return InterviewRepository.update(id, {
    status: InterviewStatus.IN_PROGRESS,
  });
}
async updateCompletedTopics(
  id: string,
  topics: string[]
) {
  return InterviewRepository.updateCompletedTopics(
    id,
    topics
  );
}

  async incrementQuestion(id: string) {
    return InterviewRepository.incrementQuestion(id);
  }

  async updateDifficulty(id: string, difficulty: interviewDifficulty) {
    return InterviewRepository.update(id, {
      difficulty,
    });
  }
}

export default new InterviewService();