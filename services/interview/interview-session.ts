import type { InterviewContext } from "./interview-context.service";
import {
  InterviewState,
  InterviewStateMachine,
} from "./interview-state.service";
import { AskedQuestion } from "./interview-memory.service";
import {
  EvaluationHistory,
} from "./interview-difficulty.service";
import { InterviewPlan } from "./interview-planner.service";
import { SkillNode } from "./interview-skill.service";

export class InterviewSession {
  readonly interviewId: string;

  context: InterviewContext;

  stateMachine = new InterviewStateMachine();

  memory: AskedQuestion[] = [];

  planner: InterviewPlan[] = [];

  skills: SkillNode[] = [];

  evaluations: EvaluationHistory[] = [];

  createdAt = new Date();

  lastActivity = new Date();

  constructor(context: InterviewContext) {
    this.interviewId = context.interviewId;
    this.context = context;

    this.stateMachine.transition(
      InterviewState.INITIALIZING
    );
  }

  touch() {
    this.lastActivity = new Date();
  }
}