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
  private latestCorrectness = 0;
  private latestCommunication = 0;
  private hasEvaluation = false;

  updateEvaluation(correctness: number, communication: number) {
    this.latestCorrectness = correctness;
    this.latestCommunication = communication;
    this.hasEvaluation = true;
  }

  reset() {
    this.latestCorrectness = 0;
    this.latestCommunication = 0;
    this.hasEvaluation = false;
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
      attention -= 60;

    if (behavior.lookingAway)
      attention -= 20;

    if (behavior.eyeContact < 95)
      attention -= (95 - behavior.eyeContact) * 0.6;

    if (behavior.blinkRate > 35)
      attention -= 8;

    if (behavior.headDirection !== "CENTER")
      attention -= 8;

    attention = Math.max(
      0,
      Math.round(attention)
    );

    // --------------------
    // Confidence
    // --------------------

    let confidence: number;

    const voiceScore = voice.confidence;
    const behaviorConfidenceScore =
      confidenceScoreService.calculate(behavior);

    if (!this.hasEvaluation) {
      // Before first AI evaluation, use only live metrics
      confidence = Math.round(
        voiceScore * 0.5 +
        behaviorConfidenceScore * 0.5
      );
    } else {
      const evaluationScore =
        (this.latestCorrectness +
          this.latestCommunication) /
        2;

      confidence = Math.round(
        voiceScore * 0.3 +
          behaviorConfidenceScore * 0.3 +
          evaluationScore * 0.4
      );
    }

    confidence = Math.max(
      0,
      Math.min(100, confidence)
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

    if (voice.responseDelay > 4000)
      communication -= 8;

    if (voice.responseDelay > 7000)
      communication -= 12;

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

    if (voice.fillerCount > 8)
      professionalism -= 5;

    if (voice.averageVolume < 0.2)
      professionalism -= 5;

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