export type LookingDirection =
  | "CENTER"
  | "LEFT"
  | "RIGHT"
  | "UP"
  | "DOWN";

class EyeContactService {
  private previousScore = 100;

  calculate(landmarks: any[]) {
    if (!landmarks?.length) {
      return {
        eyeContact: 0,
        direction: "CENTER" as LookingDirection,
      };
    }

    // Left Eye
    const leftOuter = landmarks[33];
    const leftInner = landmarks[133];
    const leftTop = landmarks[159];
    const leftBottom = landmarks[145];
    const leftIris = landmarks[468];

    // Right Eye
    const rightInner = landmarks[362];
    const rightOuter = landmarks[263];
    const rightTop = landmarks[386];
    const rightBottom = landmarks[374];
    const rightIris = landmarks[473];

    // Horizontal ratio
    const leftHorizontal =
      (leftIris.x - leftOuter.x) /
      (leftInner.x - leftOuter.x);

    const rightHorizontal =
      (rightIris.x - rightInner.x) /
      (rightOuter.x - rightInner.x);

    const horizontal =
      (leftHorizontal + rightHorizontal) / 2;

    // Vertical ratio
    const leftVertical =
      (leftIris.y - leftTop.y) /
      (leftBottom.y - leftTop.y);

    const rightVertical =
      (rightIris.y - rightTop.y) /
      (rightBottom.y - rightTop.y);

    const vertical =
      (leftVertical + rightVertical) / 2;

    let direction: LookingDirection = "CENTER";

    if (horizontal < 0.35)
      direction = "LEFT";
    else if (horizontal > 0.65)
      direction = "RIGHT";
    else if (vertical < 0.35)
      direction = "UP";
    else if (vertical > 0.65)
      direction = "DOWN";

    let score = 100;

    switch (direction) {
      case "CENTER":
        score = 100;
        break;

      case "LEFT":
      case "RIGHT":
        score = 55;
        break;

      case "UP":
      case "DOWN":
        score = 65;
        break;
    }

    // Smooth the score
    score =
      this.previousScore * 0.8 +
      score * 0.2;

    this.previousScore = score;

    return {
      eyeContact: Math.round(score),
      direction,
    };
  }
}

export default new EyeContactService();