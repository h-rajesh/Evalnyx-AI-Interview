import voiceEngine from "@/services/voice/voice-engine.service";

class TTSService {
  private speaking = false;

  async speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Select a female voice if available
      const voices = speechSynthesis.getVoices();

      const preferred =
        voices.find((v) =>
          v.name.toLowerCase().includes("female")
        ) ||
        voices.find((v) =>
          v.name.toLowerCase().includes("zira")
        ) ||
        voices.find((v) =>
          v.name.toLowerCase().includes("samantha")
        ) ||
        voices.find((v) =>
          v.name.toLowerCase().includes("google")
        );

      if (preferred) {
        utterance.voice = preferred;
      }

      this.speaking = true;

      utterance.onend = () => {
        this.speaking = false;
        voiceEngine.questionFinished();
        resolve();
      };

      speechSynthesis.speak(utterance);
    });
  }

  stop() {
    speechSynthesis.cancel();
    this.speaking = false;
  }

  isSpeaking() {
    return this.speaking;
  }
}

export default new TTSService();