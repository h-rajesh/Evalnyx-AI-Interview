"use client";

import { create } from "zustand";
import { InterviewState } from "@/types/interview-state";

interface InterviewStore {
  state: InterviewState;

  question: string;

  questionNumber: number;

  totalQuestions: number;

  transcript: string;

  aiSpeaking: boolean;

  userSpeaking: boolean;

  setState: (state: InterviewState) => void;

  setQuestion: (question: string) => void;

  setTranscript: (text: string) => void;

  nextQuestion: () => void;

  setAISpeaking: (value: boolean) => void;

  setUserSpeaking: (value: boolean) => void;

  initialize: (totalQuestions: number) => void;
}

export const useInterviewStore =
  create<InterviewStore>((set) => ({
    state: InterviewState.IDLE,

    question: "",

    questionNumber: 1,

    totalQuestions: 10,

    transcript: "",

    aiSpeaking: false,

    userSpeaking: false,

    initialize: (totalQuestions) =>
      set({
        totalQuestions,
        questionNumber: 1,
        question: "",
      }),

    setState: (state) =>
      set({
        state,
      }),

    setQuestion: (question) =>
      set({
        question,
      }),

    setTranscript: (transcript) =>
      set({
        transcript,
      }),

    nextQuestion: () =>
      set((state) => ({
        questionNumber:
          state.questionNumber + 1,

        transcript: "",
      })),

    setAISpeaking: (value) =>
      set({
        aiSpeaking: value,
      }),

    setUserSpeaking: (value) =>
      set({
        userSpeaking: value,
      }),
  }));

import interviewOrchestrator from "@/services/interview-orchestrator.service";

interviewOrchestrator.subscribe((state) => {
  useInterviewStore.getState().setState(state);
});