import { gemini } from "@/lib/ai/gemini";

class InterviewAIService {
  async process(prompt: string) {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const raw = response.text ?? "";

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error("Invalid AI Response:", cleaned);
      throw new Error("Failed to parse Gemini JSON.");
    }
  }
}

export default new InterviewAIService();