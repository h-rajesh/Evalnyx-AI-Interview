import interviewOrchestrator from "./interview-orchestrator.service";
import { InterviewState } from "@/types/interview-state";

class AISpeechService {
  private utterance: SpeechSynthesisUtterance | null = null;

  private speaking = false;

  private initialized = false;

  init() {
    if (this.initialized) return;

    this.initialized = true;

    speechSynthesis.getVoices();
  }

  private getPreferredVoice() {
    const voices = speechSynthesis.getVoices();

    const preferredNames = [
      "Google US English",
      "Microsoft Aria Online",
      "Microsoft Jenny Online",
      "Samantha",
      "Karen",
      "Moira",
    ];

    for (const name of preferredNames) {
      const voice = voices.find((v) =>
        v.name.includes(name)
      );

      if (voice) return voice;
    }

    return voices.find((v) => v.lang.startsWith("en")) ?? null;
  }

  async speak(text: string) {
    return new Promise<void>((resolve) => {
      this.stop();

      interviewOrchestrator.transition(
        InterviewState.AI_SPEAKING
      );

      this.utterance =
        new SpeechSynthesisUtterance(text);

      const voice = this.getPreferredVoice();

      if (voice) {
        this.utterance.voice = voice;
      }

      this.utterance.lang = "en-US";

      this.utterance.rate = 0.95;

      this.utterance.pitch = 1;

      this.utterance.volume = 1;

      this.utterance.onstart = () => {
        this.speaking = true;

        console.log("AI started speaking");
      };

      this.utterance.onend = () => {
        this.speaking = false;

        console.log("AI finished speaking");

        interviewOrchestrator.transition(
          InterviewState.LISTENING
        );

        resolve();
      };

      this.utterance.onerror = (e) => {
        if (e.error === "interrupted" || e.error === "canceled") {
          console.warn("AI Speech synthesis interrupted or canceled.");
        } else {
          console.error("AI Speech synthesis error:", e.error);
        }

        this.speaking = false;

        interviewOrchestrator.transition(
          InterviewState.LISTENING
        );

        resolve();
      };

      speechSynthesis.speak(this.utterance);
    });
  }

  stop() {
    speechSynthesis.cancel();

    this.speaking = false;
  }

  pause() {
    speechSynthesis.pause();
  }

  resume() {
    speechSynthesis.resume();
  }

  isSpeaking() {
    return this.speaking;
  }
}

export default new AISpeechService();