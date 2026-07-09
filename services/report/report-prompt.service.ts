import {
  Interview,
  InterviewEvaluation,
  BehaviorSnapshot,
  IntegrityEvent,
  InterviewReport,
} from "@/app/generated/prisma/client";

class ReportPromptService {
  build(data: {
    interview: Interview;
    evaluations: InterviewEvaluation[];
    snapshots: BehaviorSnapshot[];
    integrityEvents: IntegrityEvent[];
    report: InterviewReport;
  }) {
    return `
You are an expert Senior Engineering Hiring Manager.

Generate a professional interview report.

Interview Scores

Technical: ${data.report.technicalScore}

Communication: ${data.report.communicationScore}

Behavior: ${data.report.behaviorScore}

Confidence: ${data.report.confidenceScore}

Integrity: ${data.report.integrityScore}

Voice: ${data.report.voiceScore}

Overall: ${data.report.overallScore}

Recommendation:
${data.report.recommendation}

Question Evaluations:

${JSON.stringify(data.evaluations, null, 2)}

Behavior Snapshots:

${JSON.stringify(data.snapshots.slice(0, 30), null, 2)}

Integrity Events:

${JSON.stringify(data.integrityEvents, null, 2)}

Return ONLY JSON.

{
  "summary":"",
  "strengths":[
    ""
  ],
  "weaknesses":[
    ""
  ],
  "recommendation":"",
  "improvementPlan":[
    ""
  ]
}
`;
  }
}

export default new ReportPromptService();