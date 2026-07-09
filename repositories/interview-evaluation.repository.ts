import prisma from "@/lib/prisma";

class InterviewEvaluationRepository {
  async create(data: any) {
    return prisma.interviewEvaluation.create({
      data,
    });
  }
}

export default new InterviewEvaluationRepository();