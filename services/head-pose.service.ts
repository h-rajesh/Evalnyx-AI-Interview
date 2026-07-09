export type HeadDirection =
  | "CENTER"
  | "LEFT"
  | "RIGHT"
  | "UP"
  | "DOWN";

class HeadPoseService {
  calculate(matrix?: number[]) {
    if (!matrix || matrix.length < 16) {
      return {
        yaw: 0,
        pitch: 0,
        roll: 0,
        direction: "CENTER" as HeadDirection,
      };
    }

    // 4x4 transformation matrix
    const m = matrix;

    const yaw =
      Math.atan2(m[8], m[10]) *
      (180 / Math.PI);

    const pitch =
      Math.atan2(
        -m[9],
        Math.sqrt(
          m[8] * m[8] +
            m[10] * m[10]
        )
      ) *
      (180 / Math.PI);

    const roll =
      Math.atan2(m[1], m[5]) *
      (180 / Math.PI);

    let direction: HeadDirection =
      "CENTER";

    if (yaw < -15)
      direction = "LEFT";

    else if (yaw > 15)
      direction = "RIGHT";

    else if (pitch < -12)
      direction = "UP";

    else if (pitch > 12)
      direction = "DOWN";

    return {
      yaw: Math.round(yaw),
      pitch: Math.round(pitch),
      roll: Math.round(roll),
      direction,
    };
  }
}

export default new HeadPoseService();