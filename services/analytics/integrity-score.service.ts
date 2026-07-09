import { IntegrityEvent } from "@/app/generated/prisma/client";

class IntegrityScoreService {
  calculate(
    events: IntegrityEvent[]
  ) {
    let score = 100;

    events.forEach((event) => {
      score -= event.severity;
    });

    return Math.max(0, score);
  }
}

export default new IntegrityScoreService();