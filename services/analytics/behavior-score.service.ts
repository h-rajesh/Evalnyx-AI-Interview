import { BehaviorSnapshot } from "@/app/generated/prisma/client";

class BehaviorScoreService {
  calculate(
    snapshots: BehaviorSnapshot[]
  ) {
    if (!snapshots.length) return 0;

    let total = 0;

    snapshots.forEach((snapshot) => {
      let score = 100;

      score *= snapshot.eyeContact;

      if (
        snapshot.headDirection !==
        "CENTER"
      ) {
        score -= 10;
      }

      if (
        snapshot.blinkRate > 30
      ) {
        score -= 5;
      }

      total += Math.max(0, score);
    });

    return Number(
      (
        total /
        snapshots.length
      ).toFixed(2)
    );
  }
}

export default new BehaviorScoreService();