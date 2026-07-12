"use client";

import { create } from "zustand";
import { InterviewState } from "@/types/interview-state";

interface InterviewStore {
  state: InterviewState;

  question: string;

  questionNumber: number;

  totalQuestions: number;

  transcript: string;

  interimTranscript: string;

  finalTranscript: string;

  speechSegments: string[];

  aiSpeaking: boolean;

  userSpeaking: boolean;

  topic: string;

  difficulty: string;

  followUp: boolean;

  micPermissionDenied: boolean;

  setState: (state: InterviewState) => void;

  setQuestion: (question: string) => void;

  setTranscript: (text: string) => void;

  setInterimTranscript: (text: string) => void;

  setFinalTranscript: (text: string) => void;

  clearTranscript: () => void;

  addSpeechSegment: (segment: string) => void;

  clearSpeechSegments: () => void;

  nextQuestion: () => void;

  setQuestionNumber: (num: number) => void;

  setTotalQuestions: (num: number) => void;

  setAISpeaking: (value: boolean) => void;

  setUserSpeaking: (value: boolean) => void;

  initialize: (totalQuestions: number) => void;

  setTopic: (topic: string) => void;

  setDifficulty: (difficulty: string) => void;

  setFollowUp: (value: boolean) => void;

  setMicPermissionDenied: (value: boolean) => void;
}

export const useInterviewStore =
  create<InterviewStore>((set) => ({
    state: InterviewState.IDLE,

    question: "",

    questionNumber: 1,

    totalQuestions: 10,

    transcript: "",

    interimTranscript: "",

    finalTranscript: "",

    speechSegments: [],

    aiSpeaking: false,

    userSpeaking: false,

    topic: "",

    difficulty: "MEDIUM",

    followUp: false,

    micPermissionDenied: false,

    initialize: (totalQuestions) =>
      set({
        totalQuestions,
        questionNumber: 1,
        question: "",
        speechSegments: [],
        topic: "",
        difficulty: "MEDIUM",
        followUp: false,
        interimTranscript: "",
        finalTranscript: "",
        micPermissionDenied: false,
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

    setInterimTranscript: (text) =>
      set({
        interimTranscript: text,
      }),

    setFinalTranscript: (text) =>
      set({
        finalTranscript: text,
      }),

    clearTranscript: () =>
      set({
        interimTranscript: "",
        finalTranscript: "",
        transcript: "",
      }),

    addSpeechSegment: (segment) =>
      set((state) => ({
        speechSegments: [...state.speechSegments, segment],
      })),

    clearSpeechSegments: () =>
      set({
        speechSegments: [],
      }),

    nextQuestion: () =>
      set((state) => ({
        questionNumber:
          state.questionNumber + 1,

        transcript: "",
        interimTranscript: "",
        finalTranscript: "",
      })),

    setQuestionNumber: (questionNumber) =>
      set({
        questionNumber,
      }),

    setTotalQuestions: (totalQuestions) =>
      set({
        totalQuestions,
      }),

    setAISpeaking: (value) =>
      set({
        aiSpeaking: value,
      }),

    setUserSpeaking: (value) =>
      set({
        userSpeaking: value,
      }),

    setTopic: (topic) =>
      set({
        topic,
      }),

    setDifficulty: (difficulty) =>
      set({
        difficulty,
      }),

    setFollowUp: (followUp) =>
      set({
        followUp,
      }),

    setMicPermissionDenied: (value) =>
      set({
        micPermissionDenied: value,
      }),
  }));

import interviewOrchestrator from "@/services/interview-orchestrator.service";

interviewOrchestrator.subscribe((state) => {
  useInterviewStore.getState().setState(state);
});