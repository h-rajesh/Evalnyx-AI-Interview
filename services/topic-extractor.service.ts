import aiGateway from "./ai/ai-gateway";

class TopicExtractorService {
  async extract(question: string): Promise<string> {
    const prompt = `
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
`;

    const result = await aiGateway.generate(prompt, { isJson: false });
    return result || "General";
  }
}

export default new TopicExtractorService();