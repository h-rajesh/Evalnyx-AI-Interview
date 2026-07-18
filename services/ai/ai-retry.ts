export class AIRetry {
  async execute<T>(fn: (attempt: number) => Promise<T>): Promise<{ result: T; attempts: number }> {
    let lastError: any;
    for (let i = 0; i < 3; i++) {
      try {
        const result = await fn(i + 1);
        return { result, attempts: i + 1 };
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error("AI request failed after 3 attempts");
  }
}

export default new AIRetry();
