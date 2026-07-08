import { gemini } from "@/lib/ai/gemini";

class TopicExtractorService {
  async extract(question: string): Promise<string> {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are an interview topic classifier.

Return ONLY the main interview topic.

Examples:

Question:
Explain React reconciliation.

Output:
React

Question:
How does JWT authentication work?

Output:
Authentication

Question:
Explain database indexing.

Output:
Database

Question:
How would you design a URL shortener?

Output:
System Design

Question:
${question}

Output:
`,
    });

    return response.text?.trim() ?? "General";
  }
}

export default new TopicExtractorService();