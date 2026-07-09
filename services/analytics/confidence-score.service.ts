import { InterviewEvaluation } from "@/app/generated/prisma/client";

class ConfidenceScoreService {
  calculate(
    evaluations: InterviewEvaluation[]
  ) {
    if (!evaluations.length) return 0;

    const total = evaluations.reduce(
      (sum, evaluation) =>
        sum +
        evaluation.confidenceScore,
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

export default new ConfidenceScoreService();