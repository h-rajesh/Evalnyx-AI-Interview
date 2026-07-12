import { gemini } from "@/lib/ai/gemini";
import questionMemoryService from "./question-memory.service";

class InterviewAIService {
  async process(prompt: string, messages: { role: string; content: string }[] = []) {
    const response = await gemini.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    const raw = response.text ?? "";

    let cleaned = raw.trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    try {
      const parsed = JSON.parse(cleaned);

      if (parsed.nextQuestion?.question && messages.length > 0) {
        const askedQuestions = questionMemoryService.getAskedQuestions(messages);
        if (questionMemoryService.hasQuestion(parsed.nextQuestion.question, askedQuestions)) {
          throw new Error("AI generated a repeated question.");
        }
      }

      return parsed;
    } catch (error: any) {
      console.error("Invalid AI Response:", cleaned);
      throw error;
    }
  }

  async generateReport(prompt: string) {
    const response = await gemini.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    const raw = response.text ?? "";

    let cleaned = raw.trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    try {
      return JSON.parse(cleaned);
    } catch (error: any) {
      console.error("Invalid AI Response for Report:", cleaned);
      throw error;
    }
  }
}

export default new InterviewAIService();