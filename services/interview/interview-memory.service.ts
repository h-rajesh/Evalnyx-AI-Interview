import { InterviewSession } from "./interview-session";

export interface AskedQuestion {
  id: string;

  question: string;

  topic: string;

  concept: string;

  difficulty: number;

  score?: number;
}

class InterviewMemoryService {
  add(
    session: InterviewSession,
    question: AskedQuestion
  ) {
    session.touch();
    session.memory.push(question);
  }

  getAll(
    session: InterviewSession
  ) {
    return session.memory;
  }

  hasTopic(
    session: InterviewSession,
    topic: string
  ) {
    return session.memory.some(
      (q) => q.topic === topic
    );
  }

  hasConcept(
    session: InterviewSession,
    concept: string
  ) {
    return session.memory.some(
      (q) => q.concept === concept
    );
  }

  clear(
    session: InterviewSession
  ) {
    session.memory = [];
  }
}

export default new InterviewMemoryService();