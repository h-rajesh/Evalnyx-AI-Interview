import { InterviewSession } from "./interview-session";

export interface EvaluationHistory {
  technical: number;
  communication: number;
  confidence: number;
}

class InterviewDifficultyService {
  addEvaluation(session: InterviewSession, evaluation: EvaluationHistory) {
    session.touch();
    session.evaluations.push(evaluation);

    if (session.evaluations.length > 5) {
      session.evaluations.shift();
    }
  }

  currentDifficulty(session: InterviewSession): "EASY" | "MEDIUM" | "HARD" {
    if (session.evaluations.length === 0)
      return "MEDIUM";

    const average =
      session.evaluations.reduce(
        (sum, item) =>
          sum +
          item.technical +
          item.communication +
          item.confidence,
        0
      ) /
      (session.evaluations.length * 3);

    if (average >= 85)
      return "HARD";

    if (average >= 65)
      return "MEDIUM";

    return "EASY";
  }

  reset(session: InterviewSession) {
    session.evaluations = [];
  }
}

export default new InterviewDifficultyService();