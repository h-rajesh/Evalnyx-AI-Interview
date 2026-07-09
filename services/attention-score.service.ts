import { BehaviorState } from "./behavior/behavior-engine.service";

class AttentionScoreService {
    calculate(state: BehaviorState) {
        let score = 0;

        // Face Presence (40)
        if (state.hasFace) {
            score += 40;
        }

        // Eye Contact (30)
        score += state.eyeContact * 0.3;

        // Head Pose (20)
        switch (state.headDirection) {
            case "CENTER":
                score += 20;
                break;

            case "LEFT":
            case "RIGHT":
                score += 10;
                break;

            case "UP":
            case "DOWN":
                score += 5;
                break;
        }

        // Blink (10)
        if (!state.eyesClosed) {
            score += 10;
        }

        return Math.min(
            100,
            Math.round(score)
        );
    }
}

export default new AttentionScoreService();