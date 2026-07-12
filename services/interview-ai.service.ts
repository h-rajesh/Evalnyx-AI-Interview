import { gemini } from "@/lib/ai/gemini";

class InterviewAIService {
  async process(prompt: string) {
    const response = await gemini.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        temperature: 0.8,
      },
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

  async generateReport(prompt: string) {
    const response = await gemini.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    const raw = response.text ?? "";

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error("Invalid AI Response for Report:", cleaned);
      throw new Error("Failed to parse Gemini JSON for Report.");
    }
  }
}

export default new InterviewAIService();