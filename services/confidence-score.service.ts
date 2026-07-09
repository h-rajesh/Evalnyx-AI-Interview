import { BehaviorState } from "./behavior/behavior-engine.service";

class ConfidenceScoreService {
    calculate(state: BehaviorState) {
        let score = 0;

        // Face Presence (30)
        if (state.hasFace) {
            score += 30;
        }

        // Eye Contact (30)
        score += state.eyeContact * 0.3;

        // Head Stability (25)
        switch (state.headDirection) {
            case "CENTER":
                score += 25;
                break;

            case "LEFT":
            case "RIGHT":
                score += 15;
                break;

            case "UP":
            case "DOWN":
                score += 8;
                break;
        }

        // Blink (15)
        if (!state.eyesClosed) {
            score += 15;
        }

        return Math.min(
            100,
            Math.round(score)
        );
    }
}

export default new ConfidenceScoreService();