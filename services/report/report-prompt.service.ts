import { InterviewEvaluation, InterviewReport } from "@/app/generated/prisma/client";

class ReportPromptService {
  build(
    report: InterviewReport,
    evaluations: InterviewEvaluation[]
  ) {
    const evaluationSummary = evaluations
      .map(
        (e) => `
Question ${e.questionNumber}

Question:
${e.question}

Technical Score: ${e.technicalScore}

Communication Score: ${e.communicationScore}

Confidence Score: ${e.confidenceScore}

Correctness Score: ${e.correctnessScore}

Feedback:
${e.feedback}

Strengths:
${JSON.stringify(e.strengths)}

Weaknesses:
${JSON.stringify(e.weaknesses)}
`
      )
      .join("\n\n");

    return `
You are a Senior Technical Interviewer.

You have completed an interview.

Overall Scores:

Overall Score: ${report.overallScore}

Technical: ${report.technicalScore}

Communication: ${report.communicationScore}

Behavior: ${report.behaviorScore}

Confidence: ${report.confidenceScore}

Integrity: ${report.integrityScore}

Voice: ${report.voiceScore}

Question Evaluations:

${evaluationSummary}

Return ONLY valid JSON.

{
  "summary":"",

  "recommendation":"",

  "strengths":[
    ""
  ],

  "weaknesses":[
    ""
  ]
}
`;
  }
}

export default new ReportPromptService();