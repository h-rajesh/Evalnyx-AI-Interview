import { gemini } from "@/lib/ai/gemini";
import { AIProvider } from "./ai-provider.interface";
import { AIRequest, AIResponse } from "./ai-types";

export class GeminiProvider implements AIProvider {
  async generate(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: request.prompt,
        config: {
          temperature: request.temperature ?? 0.8,
        },
      });

      const raw = response.text ?? "";
      return {
        success: true,
        data: raw,
        provider: "Gemini",
        latency: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || String(error),
        provider: "Gemini",
        latency: Date.now() - startTime,
      };
    }
  }
}

export default new GeminiProvider();
