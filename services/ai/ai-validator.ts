export class AIValidator {
  validate(response: any): boolean {
    if (!response) return false;
    if (typeof response !== "object") return false;
    return true;
  }
}

export default new AIValidator();
