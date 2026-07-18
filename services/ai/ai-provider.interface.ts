import { AIRequest, AIResponse } from "./ai-types";

export interface AIProvider {
  generate(request: AIRequest): Promise<AIResponse>;
}