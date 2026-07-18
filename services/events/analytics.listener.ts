import eventBus from "./event-bus.service";
import { InterviewEvent } from "./event-types";
import behaviorScoreService from "@/services/behavior/behavior-score.service";

eventBus.subscribe(
  InterviewEvent.ANSWER_EVALUATED,
  async (event) => {
    const { evaluation } = event.payload as any;
    if (evaluation) {
      behaviorScoreService.updateEvaluation(
        evaluation.correctnessScore,
        evaluation.communicationScore
      );
    }
  }
);
