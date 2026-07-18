import { InterviewSession } from "./interview-session";

export interface SkillNode {
  name: string;
  completed: boolean;
  score?: number;
}

class InterviewSkillService {
  initialize(session: InterviewSession, skills: string[]) {
    session.touch();
    session.skills = skills.map(skill => ({
      name: skill,
      completed: false,
    }));
  }

  complete(session: InterviewSession, skill: string, score: number) {
    session.touch();
    const node = session.skills.find(
      s => s.name.toLowerCase() === skill.toLowerCase()
    );

    if (node) {
      node.completed = true;
      node.score = score;
    }
  }

  nextSkill(session: InterviewSession) {
    return session.skills.find(s => !s.completed);
  }

  getAll(session: InterviewSession) {
    return session.skills;
  }

  reset(session: InterviewSession) {
    session.skills = [];
  }
}

export default new InterviewSkillService();