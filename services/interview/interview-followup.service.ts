export interface FollowUpDecision {
  followUp: boolean;
  reason?: string;
}

class InterviewFollowupService {
  decide(
    technical: number,
    communication: number,
    confidence: number
  ): FollowUpDecision {

    if (technical < 60) {
      return {
        followUp: true,
        reason: "Low technical understanding",
      };
    }

    if (communication < 60) {
      return {
        followUp: true,
        reason: "Need clarification",
      };
    }

    if (confidence < 50) {
      return {
        followUp: true,
        reason: "Candidate seems unsure",
      };
    }

    return {
      followUp: false,
    };
  }
}

export default new InterviewFollowupService();