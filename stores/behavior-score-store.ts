"use client";

import { create } from "zustand";
import { BehaviorScores } from "@/services/behavior/behavior-score.service";

interface BehaviorScoreStore
  extends BehaviorScores {
  setScores: (
    scores: BehaviorScores
  ) => void;
}

export const useBehaviorScoreStore =
create<BehaviorScoreStore>((set)=>({

    attention:100,

    confidence:100,

    communication:100,

    professionalism:100,

    behavior:100,

    setScores:(scores)=>
        set(scores)

}));