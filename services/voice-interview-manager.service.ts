import ttsService from "./tts.service";
import orchestrator from "./interview-orchestrator.service";
import { InterviewState } from "@/types/interview-state";

class VoiceInterviewManager {
  async askQuestion(
    question: string,
    onStartListening: () => void
  ) {
    orchestrator.transition(InterviewState.AI_SPEAKING);

    await ttsService.speak(question);

    orchestrator.transition(InterviewState.LISTENING);

    onStartListening();
  }

  processing() {
    orchestrator.transition(InterviewState.PROCESSING_ANSWER);
  }

  finish() {
    orchestrator.transition(InterviewState.COMPLETED);
  }

  stop() {
    ttsService.stop();
    orchestrator.transition(InterviewState.IDLE);
  }
}

export default new VoiceInterviewManager();