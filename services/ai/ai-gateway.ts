import { AIProvider } from "./ai-provider.interface";
import { AIValidator } from "./ai-validator";
import { AIRetry } from "./ai-retry";
import aiNormalizer from "./ai-normalizer";
import { GeminiProvider } from "./gemini-provider";

export class AIGateway {
  constructor(
    private provider: AIProvider,
    private validator: AIValidator,
    private retry: AIRetry
  ) {}

  async generate(
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      interviewId?: string;
      isJson?: boolean;
    }
  ): Promise<any> {
    const isJson = options?.isJson ?? true;
    const interviewId = options?.interviewId || "unknown";

    const executeCall = async (attempt: number) => {
      // Step 8: Timeout protection (15 seconds) using Promise.race
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("AI request timed out after 15 seconds")), 15000);
      });

      const providerPromise = this.provider.generate({
        prompt,
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      });

      const response = await Promise.race([providerPromise, timeoutPromise]);

      if (!response.success) {
        throw new Error(response.error || "Provider generation failed");
      }

      const rawText = (response.data as string) || "";

      if (isJson) {
        let cleaned = rawText.trim();
        const jsonStart = cleaned.indexOf('{');
        const jsonEnd = cleaned.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        }

        const parsed = JSON.parse(cleaned);
        const normalized = aiNormalizer.normalize(parsed);

        // Step 4: AI Validator
        if (!this.validator.validate(normalized)) {
          throw new Error("Validation failed: Response did not match the expected schema");
        }

        return {
          data: normalized,
          rawText,
          provider: response.provider,
          latency: response.latency,
        };
      } else {
        return {
          data: rawText.trim(),
          rawText,
          provider: response.provider,
          latency: response.latency,
        };
      }
    };

    try {
      // Step 5: Retry Engine
      const { result, attempts } = await this.retry.execute(executeCall);

      // Step 9: Logging
      this.logRequest({
        interviewId,
        latency: result.latency,
        tokens: this.estimateTokens(prompt + result.rawText),
        provider: result.provider,
        promptSize: prompt.length,
        responseSize: result.rawText.length,
        retryCount: attempts - 1,
      });

      return result.data;
    } catch (error: any) {
      console.error(`[AI Gateway] Error after all retries:`, error);
      
      // Fallback
      return this.getFallback(prompt, isJson);
    }
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private logRequest(log: {
    interviewId: string;
    latency: number;
    tokens: number;
    provider: string;
    promptSize: number;
    responseSize: number;
    retryCount: number;
  }) {
    console.log(`[AI Gateway Log]`, JSON.stringify(log, null, 2));
  }

  private getFallback(prompt: string, isJson: boolean): any {
    if (!isJson) {
      return "General";
    }

    if (prompt.toLowerCase().includes("evaluation") || prompt.toLowerCase().includes("score")) {
      return {
        evaluation: {
          technicalScore: 70,
          communicationScore: 70,
          confidenceScore: 70,
          correctnessScore: 70,
          strengths: ["Clear communication structure", "Understandable explanation of basic concepts"],
          weaknesses: ["Could provide more technical depth or specific implementation details"],
          feedback: "The candidate answered the question acceptably but could expand further on structural concepts.",
          nextDifficulty: "MEDIUM",
        },
        nextQuestion: {
          question: "Can you explain the difference between synchronous and asynchronous execution in JavaScript?",
          topic: "JavaScript Fundamentals",
          concept: "Event Loop",
          difficulty: "MEDIUM",
          followUp: false,
        },
      };
    }

    return {
      nextQuestion: {
        question: "Can you describe a challenging technical problem you solved recently and how you approached it?",
        topic: "General",
        concept: "Problem Solving",
        difficulty: "MEDIUM",
        followUp: false,
      },
    };
  }
}

const defaultProvider = new GeminiProvider();
const defaultValidator = new AIValidator();
const defaultRetry = new AIRetry();

export default new AIGateway(defaultProvider, defaultValidator, defaultRetry);
