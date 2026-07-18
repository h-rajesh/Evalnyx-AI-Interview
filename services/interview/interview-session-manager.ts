
import { InterviewContext } from "./interview-context.service";
import { InterviewSession } from "./interview-session";

class InterviewSessionManager {
  private sessions = new Map<
    string,
    InterviewSession
  >();

  private readonly SESSION_TIMEOUT_MS =
    30 * 60 * 1000; // 30 minutes

  constructor() {
    if (typeof setInterval !== "undefined") {
      setInterval(() => {
        this.cleanupExpiredSessions();
      }, 5 * 60 * 1000); // every 5 minutes
    }
  }

  cleanupExpiredSessions() {
    const now = Date.now();

    for (const [id, session] of this.sessions) {
      if (
        now - session.lastActivity.getTime() >
        this.SESSION_TIMEOUT_MS
      ) {
        this.sessions.delete(id);
      }
    }
  }

  create(
    context: InterviewContext
  ) {
    const session =
      new InterviewSession(context);

    this.sessions.set(
      context.interviewId,
      session
    );

    return session;
  }

  get(
    interviewId: string
  ) {
    return this.sessions.get(
      interviewId
    );
  }

  has(
    interviewId: string
  ) {
    return this.sessions.has(
      interviewId
    );
  }

  remove(
    interviewId: string
  ) {
    this.sessions.delete(
      interviewId
    );
  }

  all() {
    return [...this.sessions.values()];
  }

  clear() {
    this.sessions.clear();
  }
}

export default new InterviewSessionManager();