import { InterviewState } from "@/types/interview-state";

type StateListener = (state: InterviewState) => void;

class InterviewOrchestrator {
  private state = InterviewState.IDLE;

  private listeners: StateListener[] = [];

  getState() {
    return this.state;
  }

  subscribe(listener: StateListener) {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(
        (l) => l !== listener
      );
    };
  }

  transition(state: InterviewState) {
    this.state = state;

    console.log(
      "Interview State:",
      state
    );

    this.listeners.forEach((listener) =>
      listener(state)
    );
  }
}

export default new InterviewOrchestrator();