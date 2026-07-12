import { BehaviorState } from "@/services/behavior/behavior-engine.service";
import { VoiceState } from "@/services/voice/voice-engine.service";
import confidenceScoreService from "@/services/confidence-score.service";

export interface BehaviorScores {
  attention: number;
  confidence: number;
  communication: number;
  professionalism: number;
  behavior: number;
}

class BehaviorScoreService {
  private latestCorrectness = 100;
  private latestCommunication = 100;

  updateEvaluation(correctness: number, communication: number) {
    this.latestCorrectness = correctness;
    this.latestCommunication = communication;
  }

  reset() {
    this.latestCorrectness = 100;
    this.latestCommunication = 100;
  }

  calculate(
    behavior: BehaviorState,
    voice: VoiceState
  ): BehaviorScores {
    // --------------------
    // Attention
    // --------------------

    let attention = 100;

    if (!behavior.hasFace)
      attention -= 50;

    if (behavior.lookingAway)
      attention -= 20;

    if (behavior.headDirection !== "CENTER")
      attention -= 10;

    attention = Math.max(0, attention);

    // --------------------
    // Confidence (30% Voice + 30% Behavior + 40% Evaluation)
    // --------------------

    const voiceScore = voice.confidence;
    const behaviorConfidenceScore = confidenceScoreService.calculate(behavior);
    const evaluationScore = (this.latestCorrectness + this.latestCommunication) / 2;

    const confidence = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          0.3 * voiceScore +
          0.3 * behaviorConfidenceScore +
          0.4 * evaluationScore
        )
      )
    );

    // --------------------
    // Communication
    // --------------------

    let communication = 100;

    if (voice.wordsPerMinute < 90)
      communication -= 15;

    if (voice.wordsPerMinute > 180)
      communication -= 10;

    communication -= Math.min(
      voice.fillerCount * 2,
      20
    );

    communication = Math.max(
      0,
      communication
    );

    // --------------------
    // Professionalism
    // --------------------

    let professionalism = 100;

    if (!behavior.hasFace)
      professionalism -= 20;

    if (behavior.lookingAway)
      professionalism -= 15;

    if (voice.responseDelay > 8000)
      professionalism -= 10;

    professionalism = Math.max(
      0,
      professionalism
    );

    // --------------------
    // Overall Behavior
    // --------------------

    const behaviorScore = Math.round(
      (
        attention +
        confidence +
        communication +
        professionalism
      ) / 4
    );

    return {
      attention: Math.round(attention),
      confidence: Math.round(confidence),
      communication: Math.round(communication),
      professionalism: Math.round(professionalism),
      behavior: behaviorScore,
    };
  }
}

export default new BehaviorScoreService();