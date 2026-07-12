"use client";

import { create } from "zustand";
import { VoiceState } from "@/services/voice/voice-engine.service";

interface VoiceStore extends VoiceState {
  setVoice: (state: VoiceState) => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  transcript: "",

  words: 0,

  wordsPerMinute: 0,

  fillerCount: 0,

  speakingTime: 0,

  silenceTime: 0,

  averageVolume: 0,

  currentVolume: 0,

  responseDelay: 0,

  confidence: 0,

  speaking: false,

  lastSpeechStarted: null,

  lastSpeechEnded: null,

  setVoice: (state) => set(state),
}));
