class BlinkService {
  private blinkCount = 0;
  private eyesClosed = false;
  private blinkStart: number | null = null;

  calculate(landmarks: any[], timestamp: number) {
    if (!landmarks?.length) {
      return {
        blinkCount: this.blinkCount,
        eyesClosed: false,
        blinkRate: 0,
        ear: 0,
      };
    }

    // LEFT EYE
    const left = this.ear(
      landmarks[33],
      landmarks[160],
      landmarks[158],
      landmarks[133],
      landmarks[153],
      landmarks[144]
    );

    // RIGHT EYE
    const right = this.ear(
      landmarks[362],
      landmarks[385],
      landmarks[387],
      landmarks[263],
      landmarks[373],
      landmarks[380]
    );

    const ear = (left + right) / 2;

    const THRESHOLD = 0.23;

    if (ear < THRESHOLD) {
      if (!this.eyesClosed) {
        this.eyesClosed = true;
        this.blinkStart = timestamp;
      }
    } else {
      if (this.eyesClosed) {
        this.eyesClosed = false;
        this.blinkCount++;
      }
    }

    return {
      ear,
      blinkCount: this.blinkCount,
      eyesClosed: this.eyesClosed,
      blinkRate: this.blinkCount,
    };
  }

  private distance(a: any, b: any) {
    return Math.sqrt(
      (a.x - b.x) ** 2 +
      (a.y - b.y) ** 2
    );
  }

  private ear(
    p1: any,
    p2: any,
    p3: any,
    p4: any,
    p5: any,
    p6: any
  ) {
    return (
      (this.distance(p2, p6) +
        this.distance(p3, p5)) /
      (2 * this.distance(p1, p4))
    );
  }
}

export default new BlinkService();