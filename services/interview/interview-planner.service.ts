import { InterviewSession } from "./interview-session";

export type InterviewStage =
  | "INTRODUCTION"
  | "FUNDAMENTALS"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "PROJECTS"
  | "BEHAVIORAL"
  | "WRAP_UP";

export interface InterviewPlan {
  stage: InterviewStage;

  questionCount: number;

  completed: boolean;
}

class InterviewPlanner {
  initialize(session: InterviewSession) {
    session.touch();
    session.planner = [
      {
        stage: "INTRODUCTION",
        questionCount: 1,
        completed: false,
      },
      {
        stage: "FUNDAMENTALS",
        questionCount: 3,
        completed: false,
      },
      {
        stage: "INTERMEDIATE",
        questionCount: 3,
        completed: false,
      },
      {
        stage: "ADVANCED",
        questionCount: 2,
        completed: false,
      },
      {
        stage: "PROJECTS",
        questionCount: 2,
        completed: false,
      },
      {
        stage: "BEHAVIORAL",
        questionCount: 2,
        completed: false,
      },
      {
        stage: "WRAP_UP",
        questionCount: 1,
        completed: false,
      },
    ];
  }

  getPlan(session: InterviewSession) {
    return session.planner;
  }

  nextStage(session: InterviewSession) {
    return session.planner.find(
      (stage) => !stage.completed
    );
  }

  complete(session: InterviewSession, stage: InterviewStage) {
    session.touch();
    const current = session.planner.find(
      (item) => item.stage === stage
    );

    if (current) {
      current.completed = true;
    }
  }

  reset(session: InterviewSession) {
    session.planner = [];
  }
}

export default new InterviewPlanner();