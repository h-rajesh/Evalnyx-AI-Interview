class EmotionService {
  calculate(blendshapes: any[]) {
    if (!blendshapes?.length) {
      return {
        emotion: "UNKNOWN",
        confidence: 0,
      };
    }

    const categories = blendshapes[0].categories;

    const score = (name: string) =>
      categories.find(
        (c: any) => c.categoryName === name
      )?.score ?? 0;

    const smile =
      (score("mouthSmileLeft") +
        score("mouthSmileRight")) / 2;

    const browUp =
      score("browInnerUp");

    const browDown =
      (score("browDownLeft") +
        score("browDownRight")) / 2;

    const jawOpen =
      score("jawOpen");

    const mouthOpen =
      score("mouthOpen");

    // Happy
    if (smile > 0.6) {
      return {
        emotion: "HAPPY",
        confidence: smile,
      };
    }

    // Surprised
    if (
      jawOpen > 0.6 &&
      browUp > 0.5
    ) {
      return {
        emotion: "SURPRISED",
        confidence:
          (jawOpen + browUp) / 2,
      };
    }

    // Frustrated
    if (browDown > 0.5) {
      return {
        emotion: "FRUSTRATED",
        confidence: browDown,
      };
    }

    return {
      emotion: "NEUTRAL",
      confidence: 0.8,
    };
  }
}

export default new EmotionService();