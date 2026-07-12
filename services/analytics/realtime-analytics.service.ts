import voiceEngine from "../voice/voice-engine.service";

export interface BehaviorMetrics {
  attention: number;
  eyeContact: number;
  confidence: number;
  emotion: string;
  blinkRate: number;
  headDirection: string;
}

class RealtimeAnalyticsService {
  private behavior: BehaviorMetrics = {
    attention: 100,
    eyeContact: 100,
    confidence: 100,
    emotion: "NEUTRAL",
    blinkRate: 0,
    headDirection: "CENTER",
  };

  updateBehavior(data: Partial<BehaviorMetrics>) {
    this.behavior = {
      ...this.behavior,
      ...data,
    };
  }

  getSnapshot() {
    const voice = voiceEngine.getState();

    const confidence =
      Math.round(
        voice.confidence * 0.4 +
        this.behavior.attention * 0.2 +
        this.behavior.eyeContact * 0.2 +
        this.behavior.confidence * 0.2
      );

    return {
      confidence,

      attention: this.behavior.attention,

      eyeContact: this.behavior.eyeContact,

      emotion: this.behavior.emotion,

      blinkRate: this.behavior.blinkRate,

      headDirection: this.behavior.headDirection,

      speaking: voice.speaking,

      voiceVolume: voice.currentVolume,
    };
  }
}

export default new RealtimeAnalyticsService();
