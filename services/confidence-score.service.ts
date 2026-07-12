import { BehaviorState } from "./behavior/behavior-engine.service";

class ConfidenceScoreService {
  calculate(state: BehaviorState): number {
    let score = 100;

    // ------------------------
    // Face Detection
    // ------------------------

    if (!state.hasFace) {
      score -= 40;
    }

    // ------------------------
    // Eye Contact
    // ------------------------

    if (state.eyeContact < 95) {
      score -= (95 - state.eyeContact) * 0.5;
    }

    // ------------------------
    // Looking Away
    // ------------------------

    if (state.lookingAway) {
      score -= 15;
    }

    // ------------------------
    // Head Direction
    // ------------------------

    switch (state.headDirection) {
      case "LEFT":
      case "RIGHT":
        score -= 8;
        break;

      case "UP":
      case "DOWN":
        score -= 12;
        break;

      case "CENTER":
      default:
        break;
    }

    // ------------------------
    // Excessive Blinking
    // ------------------------

    if (state.blinkRate > 30) {
      score -= Math.min(
        10,
        (state.blinkRate - 30) * 0.5
      );
    }

    // ------------------------
    // Eyes Closed
    // ------------------------

    if (state.eyesClosed) {
      score -= 15;
    }

    // ------------------------
    // Emotion
    // ------------------------

    switch (state.emotion) {
      case "HAPPY":
      case "CONFIDENT":
        score += 3;
        break;

      case "NEUTRAL":
        break;

      case "SAD":
      case "FEAR":
      case "ANGRY":
        score -= 8;
        break;

      case "SURPRISED":
        score -= 4;
        break;
    }

    // ------------------------
    // Clamp
    // ------------------------

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(score)
      )
    );
  }
}

export default new ConfidenceScoreService();