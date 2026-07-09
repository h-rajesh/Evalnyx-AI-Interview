class SmileService {
  calculate(blendshapes: any[]) {
    if (!blendshapes?.length) {
      return {
        smileScore: 0,
        smiling: false,
      };
    }

    const categories = blendshapes[0].categories;

    const left =
      categories.find(
        (c: any) => c.categoryName === "mouthSmileLeft"
      )?.score ?? 0;

    const right =
      categories.find(
        (c: any) => c.categoryName === "mouthSmileRight"
      )?.score ?? 0;

    const smileScore = Math.round(
      ((left + right) / 2) * 100
    );

    return {
      smileScore,
      smiling: smileScore > 40,
    };
  }
}

export default new SmileService();