import { BehaviorState } from "./behavior-engine.service";

export interface TimelinePoint {
    timestamp: number;

    attention: number;

    eyeContact: number;

    headDirection: string;

    facePresent: boolean;

    blinkCount: number;
}

class BehaviorTimelineService {
    private timeline: TimelinePoint[] = [];

    private lastSave = 0;

    update(
        state: BehaviorState,
        timestamp: number
    ) {
        // Save once every second
        if (timestamp - this.lastSave < 1000) {
            return;
        }

        this.lastSave = timestamp;

        this.timeline.push({
            timestamp,

            attention: state.attentionScore,

            eyeContact: state.eyeContact,

            headDirection: state.headDirection,

            facePresent: state.hasFace,

            blinkCount: state.blinkCount,
        });
    }

    getTimeline() {
        return [...this.timeline];
    }

    clear() {
        this.timeline = [];
        this.lastSave = 0;
    }
}

export default new BehaviorTimelineService();