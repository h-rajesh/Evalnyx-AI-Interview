export class AINormalizer {
  normalize(response: any): any {
    if (!response || typeof response !== "object") {
      return response;
    }

    const normalized: any = {};

    // Normalize top-level keys
    const evaluationSource = response.evaluation || response;
    const nextQuestionSource = response.nextQuestion;

    if (evaluationSource && typeof evaluationSource === "object") {
      normalized.evaluation = {
        technicalScore: this.extractNumber(evaluationSource, ["technicalScore", "techScore", "technical"]),
        communicationScore: this.extractNumber(evaluationSource, ["communicationScore", "commScore", "communication"]),
        confidenceScore: this.extractNumber(evaluationSource, ["confidenceScore", "confScore", "confidence"]),
        correctnessScore: this.extractNumber(evaluationSource, ["correctnessScore", "candidateScore", "score", "correctness"]),
        strengths: this.extractArray(evaluationSource, ["strengths", "strength"]),
        weaknesses: this.extractArray(evaluationSource, ["weaknesses", "weakness"]),
        feedback: this.extractString(evaluationSource, ["feedback", "comments", "evalFeedback"]),
        nextDifficulty: this.extractDifficulty(evaluationSource, ["nextDifficulty", "difficulty", "nextDiff"]),
      };
    }

    if (nextQuestionSource && typeof nextQuestionSource === "object") {
      normalized.nextQuestion = {
        question: this.extractString(nextQuestionSource, ["question", "nextQuestion", "q"]),
        topic: this.extractString(nextQuestionSource, ["topic", "nextTopic", "topicName"]),
        concept: this.extractString(nextQuestionSource, ["concept", "nextConcept", "conceptName"]) || "",
        difficulty: this.extractDifficulty(nextQuestionSource, ["difficulty", "nextDifficulty", "level"]),
        followUp: this.extractBoolean(nextQuestionSource, ["followUp", "followup", "isFollowUp"]),
      };
    } else if (response.question || response.nextQuestion) {
      // If flat structure
      normalized.nextQuestion = {
        question: this.extractString(response, ["question", "nextQuestion", "q"]),
        topic: this.extractString(response, ["topic", "nextTopic", "topicName"]),
        concept: this.extractString(response, ["concept", "nextConcept", "conceptName"]) || "",
        difficulty: this.extractDifficulty(response, ["difficulty", "nextDifficulty", "level"]),
        followUp: this.extractBoolean(response, ["followUp", "followup", "isFollowUp"]),
      };
    }

    return normalized;
  }

  private extractNumber(obj: any, keys: string[]): number {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        const val = Number(obj[key]);
        if (!isNaN(val)) return val;
      }
    }
    return 0;
  }

  private extractString(obj: any, keys: string[]): string {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return String(obj[key]);
      }
    }
    return "";
  }

  private extractBoolean(obj: any, keys: string[]): boolean {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return !!obj[key];
      }
    }
    return false;
  }

  private extractArray(obj: any, keys: string[]): string[] {
    for (const key of keys) {
      if (Array.isArray(obj[key])) {
        return obj[key].map(String);
      } else if (obj[key] && typeof obj[key] === "string") {
        return [obj[key]];
      }
    }
    return [];
  }

  private extractDifficulty(obj: any, keys: string[]): "EASY" | "MEDIUM" | "HARD" {
    const val = this.extractString(obj, keys).toUpperCase();
    if (val.includes("EASY")) return "EASY";
    if (val.includes("HARD")) return "HARD";
    return "MEDIUM"; // Default fallback
  }
}

export default new AINormalizer();
