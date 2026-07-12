import interviewOrchestrator from "./interview-orchestrator.service";
import { InterviewState } from "@/types/interview-state";
import voiceEngine from "./voice/voice-engine.service";
import { useInterviewStore } from "@/stores/interview-store";
import { useVoiceStore } from "@/stores/voice-store";

class SpeechRecognitionService {
  private recognition: any = null;

  private transcript = "";

  private silenceTimer: NodeJS.Timeout | null = null;

  private listening = false;

  private isMutedForAISpeaking = false;

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

    // Mute speech recognition while AI is speaking
    interviewOrchestrator.subscribe((state) => {
      if (state === InterviewState.AI_SPEAKING) {
        if (this.listening && this.recognition) {
          console.log("Muting speech recognition while AI is speaking...");
          this.isMutedForAISpeaking = true;
          this.recognition.stop();
        }
      } else if (state === InterviewState.LISTENING || state === InterviewState.USER_SPEAKING) {
        if (this.isMutedForAISpeaking) {
          this.isMutedForAISpeaking = false;
          if (!this.listening && this.answerCallback && this.recognition) {
            console.log("Resuming speech recognition...");
            try {
              this.recognition.start();
            } catch (err) {
              console.warn("Failed to resume speech recognition:", err);
            }
          }
        }
      }
    });
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

      // Auto-restart if we still have an active callback
      if (this.answerCallback && !this.isMutedForAISpeaking) {
        console.log("Speech Recognition: auto-restarting...");
        try {
          this.recognition.start();
        } catch (err) {
          console.warn("Failed to auto-restart speech recognition:", err);
        }
      }
    };

    this.recognition.onerror = (e: any) => {
      if (e.error === "no-speech") {
        console.warn("Speech Recognition: no speech detected");
        return;
      }
      if (e.error === "not-allowed") {
        useInterviewStore.getState().setMicPermissionDenied(true);
      }
      console.error("Speech Recognition Error:", e.error, e.message);
    };

    this.recognition.onresult = (event: any) => {
      const stateVolume = voiceEngine.updateSpeaking(true, 1);
      useVoiceStore.getState().setVoice(stateVolume);

      let text = "";

      let final = false;

      for (
        let i = 0;
        i < event.results.length;
        i++
      ) {
        text +=
          event.results[i][0].transcript + " ";

        if (event.results[i].isFinal)
          final = true;
      }

      this.transcript = text.trim();

      const stateTranscript = voiceEngine.updateTranscript(
        this.transcript,
        final
      );
      useVoiceStore.getState().setVoice(stateTranscript);

      const store = useInterviewStore.getState();

      if (final) {
        store.setFinalTranscript(this.transcript);
        store.setInterimTranscript("");
      } else {
        store.setInterimTranscript(this.transcript);
      }

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

    const stateVolumeOff = voiceEngine.updateSpeaking(false, 0);
    useVoiceStore.getState().setVoice(stateVolumeOff);

    interviewOrchestrator.transition(
      InterviewState.PROCESSING_ANSWER
    );

    // Call recognition.stop directly instead of this.stop() to keep the callback active
    if (this.recognition) {
      this.recognition.stop();
    }

    if (this.answerCallback) {
      await this.answerCallback(
        this.transcript
      );
    }

    this.transcript = "";
    useInterviewStore
      .getState()
      .clearTranscript();
  }

  start(
    callback: (
      transcript: string
    ) => Promise<void>
  ) {
    if (!this.recognition) return;

    this.isMutedForAISpeaking = false;
    this.answerCallback = callback;

    this.transcript = "";
    useInterviewStore
      .getState()
      .clearTranscript();

    interviewOrchestrator.transition(
      InterviewState.LISTENING
    );

    if (this.listening) {
      console.log("Speech Recognition is already running. Callback updated.");
      return;
    }

    try {
      this.recognition.start();
    } catch (err) {
      console.warn("Failed to start SpeechRecognition:", err);
    }
  }

  stop() {
    if (!this.recognition) return;

    this.isMutedForAISpeaking = false;
    this.answerCallback = null;
    this.recognition.stop();
  }

  isListening() {
    return this.listening;
  }
}

export default new SpeechRecognitionService();