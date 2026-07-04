import { create } from "zustand";

export interface InterviewConfig {
  role: string;
  level: string;
  type: string;
  difficulty: string;
  language: string;
  duration: string;
  jobDescription: string;
  resumeName: string;
}

interface InterviewState {
  config: InterviewConfig;
  setConfig: (patch: Partial<InterviewConfig>) => void;
  reset: () => void;
}

const initial: InterviewConfig = {
  role: "Frontend Engineer",
  level: "Mid-level",
  type: "Technical",
  difficulty: "Medium",
  language: "TypeScript",
  duration: "30 minutes",
  jobDescription: "",
  resumeName: "",
};

export const useInterviewStore = create<InterviewState>((set) => ({
  config: initial,
  setConfig: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),
  reset: () => set({ config: initial }),
}));
