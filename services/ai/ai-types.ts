export interface AIRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  provider: string;
  latency: number;
}