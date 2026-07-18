import interviewPlanner from "./interview-planner.service";
import interviewMemory from "./interview-memory.service";
import interviewSkill from "./interview-skill.service";
import interviewDifficulty from "./interview-difficulty.service";
import interviewFollowup from "./interview-followup.service";
import interviewValidator from "./interview-validator.service";
import { InterviewSession } from "./interview-session";
import { AskedQuestion } from "./interview-memory.service";
import { InterviewState } from "./interview-state.service";

class InterviewEngine {
  initialize(session: InterviewSession) {
    session.touch();
    interviewPlanner.initialize(session);
    session.stateMachine.reset();
  }

  state(session: InterviewSession) {
    return session.stateMachine.getState();
  }

  setState(session: InterviewSession, state: InterviewState) {
    session.touch();
    session.stateMachine.transition(state);
  }

  remember(
    session: InterviewSession,
    question: AskedQuestion
  ) {
    session.touch();
    interviewMemory.add(session, question);
  }

  nextSkill(session: InterviewSession) {
    return interviewSkill.nextSkill(session);
  }

  difficulty(session: InterviewSession) {
    return interviewDifficulty.currentDifficulty(session);
  }

  shouldFollowup(
    session: InterviewSession,
    technical: number,
    communication: number,
    confidence: number
  ) {
    return interviewFollowup.decide(
      technical,
      communication,
      confidence
    );
  }

  validate(
    session: InterviewSession,
    topic: string,
    concept: string
  ) {
    return interviewValidator.validateQuestion(
      session,
      topic,
      concept
    );
  }

  completeSkill(
    session: InterviewSession,
    skill: string,
    score: number
  ) {
    session.touch();
    interviewSkill.complete(
      session,
      skill,
      score
    );
  }
}

export default new InterviewEngine();