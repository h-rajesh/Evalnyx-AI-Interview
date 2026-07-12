"use client";

import { useQuery } from "@tanstack/react-query";

export interface InterviewReportResponse {
  success: boolean;

  report: {
    id: string;

    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    behaviorScore: number;
    confidenceScore: number;
    integrityScore: number;
    voiceScore: number;

    recommendation: string;
    summary: string | null;

    strengths: string[];
    weaknesses: string[];

    learningRoadmap: any[] | null;
    suggestedAnswers: any[] | null;
    careerAdvice: string | null;
    nextInterviewDifficulty: string | null;

    interview: {
      title: string;
      jobRole: string;
      interviewType: string;

      evaluations: any[];

      snapshots: any[];

      integrityEvents: any[];

      timelineEvents: any[];
    };
  };
  replay: {
    messages: any[];
    evaluations: any[];
    snapshots: any[];
    integrity: any[];
    timeline: any[];
  };
}

async function fetchReport(interviewId: string) {
  const res = await fetch(`/api/interview/report/${interviewId}`);

  if (!res.ok) {
    throw new Error("Failed to load report");
  }

  return res.json() as Promise<InterviewReportResponse>;
}

export function useInterviewReport(interviewId: string) {
  return useQuery({
    queryKey: ["interview-report", interviewId],
    queryFn: () => fetchReport(interviewId),
    enabled: !!interviewId,
  });
}