import aiGateway from "./ai/ai-gateway";
import questionMemoryService from "./question-memory.service";

class InterviewAIService {
  async process(prompt: string, messages: { role: string; content: string }[] = []) {
    const parsed = await aiGateway.generate(prompt, { temperature: 0.8, isJson: true });

    if (parsed.nextQuestion?.question && messages.length > 0) {
      const askedQuestions = questionMemoryService.getAskedQuestions(messages);
      if (questionMemoryService.hasQuestion(parsed.nextQuestion.question, askedQuestions)) {
        console.warn("AI generated a repeated question, returning parsed output");
      }
    }

    return parsed;
  }

  async generateReport(prompt: string) {
    return await aiGateway.generate(prompt, { temperature: 0.8, isJson: true });
  }
}

export default new InterviewAIService();