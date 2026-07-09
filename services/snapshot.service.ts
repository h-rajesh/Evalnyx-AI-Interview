import behaviorEngine from "./behavior/behavior-engine.service";
import voiceEngine from "./voice/voice-engine.service";

class SnapshotService {
  private timer: NodeJS.Timeout | null = null;

  start(interviewId: string) {
    if (this.timer) return;

    const startedAt = Date.now();

    this.timer = setInterval(async () => {
      try {
        const behavior = behaviorEngine.getState();
        const voice = voiceEngine.getState();

        const second = Math.floor(
          (Date.now() - startedAt) / 1000
        );

        await fetch("/api/interview/behavior", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interviewId,
            second,
            attention: behavior.eyeContact,
            confidence: voice.confidence,
            eyeContact: behavior.eyeContact,
            headDirection: behavior.headDirection,
            emotion: "UNKNOWN",
            blinkRate: behavior.blinkRate,
            speaking: voice.speaking,
            voiceVolume: voice.averageVolume,
          }),
        });
      } catch (err) {
        console.error(err);
      }
    }, 1000);
  }

  stop() {
    if (!this.timer) return;

    clearInterval(this.timer);

    this.timer = null;
  }
}

export default new SnapshotService();