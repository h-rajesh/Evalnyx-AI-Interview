import eyeContactService from "./eye-contact.service";
import headPoseService from "../head-pose.service";
import blinkService from "./blink.service";
import attentionScoreService from "../attention-score.service";
import behaviorTimelineService from "./behavior-timeline.service";
import confidenceScoreService from "../confidence-score.service";
import smileService from "./smile.service";
import emotionService from "./emotion.service";
import voiceActivityService from "../voice-activity.service";

export interface BehaviorState {
  // Face
  hasFace: boolean;
  faces: number;

  faceFrames: number;
  missingFrames: number;

  firstSeen: number | null;
  lastSeen: number | null;
  awaySince: number | null;

  // Eye Contact
  eyeContact: number;

  lookingDirection:
  | "CENTER"
  | "LEFT"
  | "RIGHT"
  | "UP"
  | "DOWN";

  lookingAway: boolean;

  // Head Pose
  headYaw: number;
  headPitch: number;
  headRoll: number;

  headDirection:
  | "CENTER"
  | "LEFT"
  | "RIGHT"
  | "UP"
  | "DOWN";

  // Blink
  blinkCount: number;
  blinkRate: number;
  eyesClosed: boolean;
  ear: number;

  attentionScore: number;
  attention: number;

  confidenceScore: number;
  confidence: number;

  smileScore: number;

  smiling: boolean;

  emotion: string | null;

  emotionConfidence: number;

  speaking: boolean;

  voiceVolume: number;


}

interface UpdateParams {
  faceCount: number;
  landmarks: any[] | null;
  matrix: number[] | null;
  blendshapes: any[] | null;
  timestamp: number;
}

class BehaviorEngine {
  private state: BehaviorState = {
    // Face
    hasFace: false,
    faces: 0,

    faceFrames: 0,
    missingFrames: 0,

    firstSeen: null,
    lastSeen: null,
    awaySince: null,

    // Eyes
    eyeContact: 0,
    lookingDirection: "CENTER",
    lookingAway: false,

    // Head
    headYaw: 0,
    headPitch: 0,
    headRoll: 0,
    headDirection: "CENTER",

    // Blink
    blinkCount: 0,
    blinkRate: 0,
    eyesClosed: false,
    ear: 0,

    // Attention
    attentionScore: 0,
    attention: 0,

    confidenceScore: 0,
    confidence: 0,

    smileScore: 0,

    smiling: false,

    emotion: null,

    emotionConfidence: 0,

    speaking: false,

    voiceVolume: 0,
  };

  update({
    faceCount,
    landmarks,
    matrix,
    blendshapes,
    timestamp,
  }: UpdateParams): BehaviorState {
    this.state.faces = faceCount;

    // ============================
    // FACE PRESENCE
    // ============================

    if (faceCount > 0) {
      this.state.faceFrames++;
      this.state.missingFrames = 0;

      this.state.lastSeen = timestamp;

      if (!this.state.firstSeen) {
        this.state.firstSeen = timestamp;
      }

      this.state.awaySince = null;

      if (
        !this.state.hasFace &&
        this.state.faceFrames >= 3
      ) {
        this.state.hasFace = true;
        console.log("✅ Face Detected");
      }
    } else {
      this.state.faceFrames = 0;
      this.state.missingFrames++;

      if (!this.state.awaySince) {
        this.state.awaySince = timestamp;
      }

      if (
        this.state.hasFace &&
        this.state.missingFrames >= 5
      ) {
        this.state.hasFace = false;
        console.log("❌ Face Lost");
      }
    }

    // ============================
    // FACE ANALYSIS
    // ============================

    if (landmarks && faceCount > 0) {
      // --------------------------
      // Eye Contact
      // --------------------------

      const eye =
        eyeContactService.calculate(landmarks);

      Object.assign(this.state, {
        eyeContact: eye.eyeContact,
        lookingDirection: eye.direction,
      });

      // --------------------------
      // Blink Detection
      // --------------------------

      const blink =
        blinkService.calculate(
          landmarks,
          timestamp
        );

      Object.assign(this.state, {
        blinkCount: blink.blinkCount,
        blinkRate: blink.blinkRate,
        eyesClosed: blink.eyesClosed,
        ear: Number(blink.ear.toFixed(3)),
      });

      // --------------------------
      // Head Pose
      // --------------------------

      if (matrix) {
        const head =
          headPoseService.calculate(matrix);

        Object.assign(this.state, {
          headYaw: head.yaw,
          headPitch: head.pitch,
          headRoll: head.roll,
          headDirection: head.direction,
        });
      }

      if (blendshapes) {
        const smile =
          smileService.calculate(
            blendshapes
          );

        Object.assign(this.state, {
          smileScore:
            smile.smileScore,

          smiling:
            smile.smiling,
        });
        const emotion =
          emotionService.calculate(
            blendshapes
          );

        Object.assign(this.state, {
          emotion: emotion.emotion,
          emotionConfidence:
            Number(
              emotion.confidence.toFixed(2)
            ),
        });
      }



      // --------------------------
      // Looking Away
      // --------------------------

      this.state.lookingAway =
        this.state.lookingDirection !== "CENTER" ||
        this.state.headDirection !== "CENTER";

      // --------------------------
      // Attention Score
      // --------------------------

      this.state.attention = this.state.attentionScore =
        attentionScoreService.calculate(
          this.state
        );

      behaviorTimelineService.update(
        this.state,
        timestamp
      );

      this.state.confidence = this.state.confidenceScore =
        confidenceScoreService.calculate(this.state);

    } else {
      // Keep cumulative metrics (blinkCount) but clear live metrics

      Object.assign(this.state, {
        eyeContact: 0,

        lookingDirection: "CENTER",

        lookingAway: false,

        headYaw: 0,

        headPitch: 0,

        headRoll: 0,

        headDirection: "CENTER",

        eyesClosed: false,

        ear: 0,

        attentionScore: 0,
        attention: 0,

        confidenceScore: 0,
        confidence: 0,

        smileScore: 0,

        smiling: false,

        emotion: null,

        emotionConfidence: 0,
      });
    }

    // Voice activity is independent of face tracking
    this.state.speaking = voiceActivityService.isSpeaking();
    this.state.voiceVolume = voiceActivityService.getVolume();

    return {
      ...this.state,
    };
  }

  getState() {
    return {
      ...this.state,
    };
  }
}

export default new BehaviorEngine();