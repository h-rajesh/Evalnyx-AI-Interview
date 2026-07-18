export enum InterviewState {
  INITIALIZING = "INITIALIZING",

  ASKING_QUESTION = "ASKING_QUESTION",

  WAITING_FOR_ANSWER = "WAITING_FOR_ANSWER",

  EVALUATING_ANSWER = "EVALUATING_ANSWER",

  GENERATING_NEXT_QUESTION = "GENERATING_NEXT_QUESTION",

  COMPLETED = "COMPLETED",

  FAILED = "FAILED",
}

export class InterviewStateMachine {
  private state: InterviewState =
    InterviewState.INITIALIZING;

  getState() {
    return this.state;
  }

  transition(next: InterviewState) {
    this.state = next;
  }

  is(state: InterviewState) {
    return this.state === state;
  }

  reset() {
    this.state =
      InterviewState.INITIALIZING;
  }
}

export default InterviewStateMachine;