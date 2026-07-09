import { InterviewEvaluation } from "@/app/generated/prisma/client";

class CommunicationScoreService {
  calculate(
    evaluations: InterviewEvaluation[]
  ): number {
    if (!evaluations.length) return 0;

    const total = evaluations.reduce(
      (sum, evaluation) =>
        sum +
        evaluation.communicationScore,
      0
    );

    return Number(
      (
        total /
        evaluations.length
      ).toFixed(2)
    );
  }
}

export default new CommunicationScoreService();