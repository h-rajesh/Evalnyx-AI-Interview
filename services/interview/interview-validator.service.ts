import interviewMemory from "./interview-memory.service";
import { InterviewSession } from "./interview-session";

class InterviewValidator {

  isDuplicate(
    session: InterviewSession,
    topic: string,
    concept: string
  ) {
    if (
      interviewMemory.hasTopic(session, topic)
    )
      return true;

    if (
      interviewMemory.hasConcept(session, concept)
    )
      return true;

    return false;
  }

  validateQuestion(
    session: InterviewSession,
    topic: string,
    concept: string
  ) {
    return !this.isDuplicate(
      session,
      topic,
      concept
    );
  }
}

export default new InterviewValidator();