"use client";

import { create } from "zustand";
import { BehaviorState } from "@/services/behavior/behavior-engine.service";

interface BehaviorStore extends BehaviorState {
  setBehavior: (state: BehaviorState) => void;
}

export const useBehaviorStore = create<BehaviorStore>((set) => ({
  hasFace: false,
  faces: 0,

  faceFrames: 0,
  missingFrames: 0,

  firstSeen: null,
  lastSeen: null,
  awaySince: null,

  eyeContact: 0,
  lookingDirection: "CENTER",

  lookingAway: false,

  headYaw: 0,
  headPitch: 0,
  headRoll: 0,

  headDirection: "CENTER",

  blinkCount: 0,
  blinkRate: 0,

  eyesClosed: false,

  ear: 0,

  attentionScore: 0,
  attention: 0,

  confidenceScore: 0,
  confidence: 0,

  smileScore: 0,

  smiling: false,

  emotion: null,

  emotionConfidence: 0,

  speaking: false,

  voiceVolume: 0,

  setBehavior: (state) => set(state),
}));
