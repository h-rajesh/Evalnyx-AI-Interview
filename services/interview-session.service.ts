import aiSpeechService from "./ai-speech.service";
import speechRecognitionService from "./speech-recognition.service";
import interviewOrchestrator from "./interview-orchestrator.service";
import { useInterviewStore } from "@/stores/interview-store";

import { InterviewState } from "@/types/interview-state";

class InterviewSessionService {
  async start(interviewId: string) {
    console.log("Interview Started");

    await this.askNextQuestion(interviewId);
  }

  private async askNextQuestion(
    interviewId: string
  ) {
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

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.completed) {
        return this.finish(interviewId);
      }

      // Update counter: first question asked should not increment, subsequent should
      const currentStoreQuestion = useInterviewStore.getState().question;
      if (currentStoreQuestion) {
        useInterviewStore.getState().nextQuestion();
      }
      useInterviewStore.getState().setQuestion(data.question);

      await aiSpeechService.speak(
        data.question
      );

      speechRecognitionService.start(
        async (answer) => {
          await this.submitAnswer(
            interviewId,
            answer
          );
        }
      );
    } catch (error) {
      console.error(error);

      interviewOrchestrator.transition(
        InterviewState.IDLE
      );

      await aiSpeechService.speak(
        "I'm sorry, something went wrong. Please try again."
      );
    }
  }

  private async submitAnswer(
    interviewId: string,
    answer: string
  ) {
    interviewOrchestrator.transition(
      InterviewState.EVALUATING
    );

    try {
      const response = await fetch(
        "/api/interview/answer",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            interviewId,

            answer,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.completed) {
        return this.finish(interviewId);
      }

      // Update counter: first question asked should not increment, subsequent should
      const currentStoreQuestion = useInterviewStore.getState().question;
      if (currentStoreQuestion) {
        useInterviewStore.getState().nextQuestion();
      }
      useInterviewStore.getState().setQuestion(data.question);

      await aiSpeechService.speak(
        data.question
      );

      speechRecognitionService.start(
        async (nextAnswer) => {
          await this.submitAnswer(
            interviewId,
            nextAnswer
          );
        }
      );
    } catch (error) {
      console.error(error);

      interviewOrchestrator.transition(
        InterviewState.IDLE
      );

      await aiSpeechService.speak(
        "I'm sorry, something went wrong. Please try again."
      );
    }
  }

  async finish(interviewId: string) {
    interviewOrchestrator.transition(
      InterviewState.COMPLETED
    );

    speechRecognitionService.stop();

    await aiSpeechService.speak(
      "Thank you. That concludes today's interview. Your report is now being generated."
    );

    try {
      const response = await fetch(
        "/api/interview/finish",
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

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    }

    console.log(
      "Interview Completed"
    );
  }
}

export default new InterviewSessionService();