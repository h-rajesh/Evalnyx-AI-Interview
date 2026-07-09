import interviewOrchestrator from "./interview-orchestrator.service";
import { InterviewState } from "@/types/interview-state";
import voiceEngine from "./voice/voice-engine.service";
import { useInterviewStore } from "@/stores/interview-store";

class SpeechRecognitionService {
  private recognition: any = null;

  private transcript = "";

  private silenceTimer: NodeJS.Timeout | null = null;

  private listening = false;

  private answerCallback:
    | ((answer: string) => Promise<void>)
    | null = null;

  constructor() {
    if (typeof window === "undefined") return;

    const API =
      window.SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!API) {
      console.error(
        "Speech Recognition not supported."
      );
      return;
    }

    this.recognition = new API();

    this.recognition.lang = "en-US";

    this.recognition.continuous = true;

    this.recognition.interimResults = true;

    this.registerEvents();
  }

  private registerEvents() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.listening = true;

      console.log("🎤 Listening...");
    };

    this.recognition.onend = () => {
      this.listening = false;

      console.log("🛑 Recognition stopped");
    };

    this.recognition.onerror = (e: any) => {
      console.error(e);
    };

    this.recognition.onresult = (event: any) => {
      voiceEngine.updateSpeaking(true, 1);

      let text = "";

      let final = false;

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        text +=
          event.results[i][0].transcript + " ";

        if (event.results[i].isFinal)
          final = true;
      }

      this.transcript = text.trim();

      voiceEngine.updateTranscript(
        this.transcript,
        final
      );

      useInterviewStore.getState().setTranscript(this.transcript);

      if (this.transcript.length > 0) {
        interviewOrchestrator.transition(
          InterviewState.USER_SPEAKING
        );
      }

      this.resetSilenceTimer();
    };
  }

  private resetSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    this.silenceTimer = setTimeout(async () => {
      await this.finishAnswer();
    }, 2000);
  }

  private async finishAnswer() {
    if (!this.transcript.trim()) return;

    console.log(
      "✅ Final Answer:",
      this.transcript
    );

    voiceEngine.updateSpeaking(false, 0);

    interviewOrchestrator.transition(
      InterviewState.PROCESSING_ANSWER
    );

    this.stop();

    if (this.answerCallback) {
      await this.answerCallback(
        this.transcript
      );
    }

    this.transcript = "";
    useInterviewStore.getState().setTranscript("");
  }

  start(
    callback: (
      transcript: string
    ) => Promise<void>
  ) {
    if (!this.recognition) return;

    this.answerCallback = callback;

    this.transcript = "";
    useInterviewStore.getState().setTranscript("");

    interviewOrchestrator.transition(
      InterviewState.LISTENING
    );

    this.recognition.start();
  }

  stop() {
    if (!this.recognition) return;

    this.recognition.stop();
  }

  isListening() {
    return this.listening;
  }
}

export default new SpeechRecognitionService();