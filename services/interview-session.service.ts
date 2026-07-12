import aiSpeechService from "./ai-speech.service";
import speechRecognitionService from "./speech-recognition.service";
import interviewOrchestrator from "./interview-orchestrator.service";

import { InterviewState } from "@/types/interview-state";
import { useInterviewStore } from "@/stores/interview-store";
import voiceEngine from "./voice/voice-engine.service";
import { useVoiceStore } from "@/stores/voice-store";
import behaviorScoreService from "./behavior/behavior-score.service";

interface StartResponse {
  success: boolean;
  question: string;
  topic: string;
  difficulty: string;
  followUp: boolean;
  currentQuestion?: number;
  totalQuestions?: number;
}

interface AnswerResponse extends StartResponse {
  completed: boolean;
  evaluation?: any;
}

class InterviewSessionService {
  private interviewId = "";

  private running = false;

  async start(interviewId: string) {
    if (this.running) return;

    this.running = true;

    this.interviewId = interviewId;

    interviewOrchestrator.transition(
      InterviewState.GENERATING_QUESTION
    );

    try {
      const response = await fetch(
        "/api/interview/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interviewId,
          }),
        }
      );

      const data: StartResponse =
        await response.json();

      if (!data.success) {
        throw new Error(
          "Failed to start interview."
        );
      }

      const store = useInterviewStore.getState();
      store.setQuestion(data.question);
      store.setTopic(data.topic);
      store.setDifficulty(data.difficulty);
      store.setFollowUp(data.followUp);

      if (data.currentQuestion !== undefined) {
        store.setQuestionNumber(data.currentQuestion);
      }
      if (data.totalQuestions !== undefined) {
        store.setTotalQuestions(data.totalQuestions);
      }
      store.clearSpeechSegments();
      store.clearTranscript();
      voiceEngine.reset();
      behaviorScoreService.reset();
      useVoiceStore.getState().setVoice(voiceEngine.getState());

      await aiSpeechService.speak(
        data.question
      );

      speechRecognitionService.start(
        this.onSpeechSegmentComplete
      );
    } catch (err) {
      console.error(err);

      this.running = false;
    }
  }

  private onSpeechSegmentComplete = async (
    segment: string
  ) => {
    if (!this.running) return;

    console.log("Segment complete:", segment);
    useInterviewStore.getState().addSpeechSegment(segment);

    // Keep listening
    speechRecognitionService.start(
      this.onSpeechSegmentComplete
    );
  };

  submitAnswer = async (
    answer: string
  ) => {
    if (!this.running) return;

    const currentState = useInterviewStore.getState().state;
    if (
      currentState === InterviewState.EVALUATING ||
      currentState === InterviewState.PROCESSING_ANSWER
    ) {
      console.warn("Already submitting an answer. Duplicate request ignored.");
      return;
    }

    // Stop speech recognition while evaluating
    speechRecognitionService.stop();

    interviewOrchestrator.transition(
      InterviewState.EVALUATING
    );

    try {
      const response = await fetch(
        "/api/interview/answer",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            interviewId:
              this.interviewId,
            answer,
          }),
        }
      );

      const data: AnswerResponse =
        await response.json();

      if (!data.success) {
        throw new Error(
          "Answer submission failed."
        );
      }

      if (data.evaluation) {
        behaviorScoreService.updateEvaluation(
          data.evaluation.correctnessScore,
          data.evaluation.communicationScore
        );
      }

      if (data.completed) {
        return this.finish();
      }

      if (data.currentQuestion !== undefined) {
        useInterviewStore.getState().setQuestionNumber(data.currentQuestion);
      }
      if (data.totalQuestions !== undefined) {
        useInterviewStore.getState().setTotalQuestions(data.totalQuestions);
      }

      const store = useInterviewStore.getState();
      store.setQuestion(data.question);
      store.setTopic(data.topic);
      store.setDifficulty(data.difficulty);
      store.setFollowUp(data.followUp);

      // Clear speech segments and transcript for the next question
      store.clearSpeechSegments();
      store.clearTranscript();

      await aiSpeechService.speak(
        data.question
      );

      speechRecognitionService.start(
        this.onSpeechSegmentComplete
      );
    } catch (err) {
      console.error(err);

      this.running = false;
    }
  };

  async finish() {
    interviewOrchestrator.transition(
      InterviewState.COMPLETED
    );

    speechRecognitionService.stop();

    await aiSpeechService.speak(
      "Thank you. Your interview has been completed."
    );

    const response = await fetch("/api/interview/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        interviewId: this.interviewId,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      let msg = "Failed to finalize the interview session.";
      try {
        const parsed = JSON.parse(text);
        msg = parsed.message || msg;
      } catch {}
      throw new Error(msg);
    }

    this.running = false;
  }

  stop() {
    speechRecognitionService.stop();

    aiSpeechService.stop();

    this.running = false;
  }

  isRunning() {
    return this.running;
  }
}

export default new InterviewSessionService();