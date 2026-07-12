class QuestionMemoryService {
  normalize(question: string) {
    return question
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();
  }

  getAskedQuestions(messages: { role: string; content: string }[]) {
    return messages
      .filter((m) => m.role === "ASSISTANT")
      .map((m) => this.normalize(m.content));
  }

  hasQuestion(
    question: string,
    askedQuestions: string[]
  ) {
    const normalized = this.normalize(question);

    return askedQuestions.some(
      (q) =>
        normalized.includes(q) ||
        q.includes(normalized)
    );
  }

  buildQuestionHistory(messages: { role: string; content: string }[]) {
    const questions = this.getAskedQuestions(messages);

    if (!questions.length) {
      return "No previous questions.";
    }

    return questions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n");
  }
}

export default new QuestionMemoryService();