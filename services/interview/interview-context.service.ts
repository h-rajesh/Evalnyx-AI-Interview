import { InterviewState } from "./interview-state.service";
import { InterviewSession } from "./interview-session";

export interface InterviewContext {
  interviewId: string;

  role: string;

  experience: string;

  difficulty: number;

  currentQuestion: number;

  totalQuestions: number;

  startedAt: Date;

  state: InterviewState;
}

class InterviewContextService {
  get(session: InterviewSession) {
    return session.context;
  }

  update(
    session: InterviewSession,
    updates: Partial<InterviewContext>
  ) {
    session.touch();
    session.context = {
      ...session.context,
      ...updates,
    };
  }

  clear(session: InterviewSession) {
    // Session context is not nulled since it's part of the session lifecycle,
    // but we can support clearing or reset if necessary.
  }
}

export default new InterviewContextService();