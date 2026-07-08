"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import {
  Bot,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  SkipForward,
  ChevronRight,
  Clock,
  AudioLines,
  Sparkles,
  CircleDot,
  Send,
  Pencil,
  Check,
} from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  interviewQuestions,
  liveTranscript,
} from "@/lib/mock-data";
import CameraPreview from "@/components/interview/CameraPreview";
import LiveInterview from "@/components/interview/LiveInterview";

function useTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return `${mm}:${ss}`;
}

export default function InterviewRoom() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isCompleted = localStorage.getItem(`completed_interview_${id}`);
      if (isCompleted === "true") {
        router.replace("/dashboard");
      }
    }
  }, [id, router]);

  const timer = useTimer();
  const [aiQuestion, setAiQuestion] = useState("");
  const [conversation, setConversation] = useState<
    {
      role: "assistant" | "user";
      text: string;
    }[]
  >([]);

  const [qIndex, setQIndex] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [speechSegments, setSpeechSegments] = useState<string[]>([]);
  const liveSpeech = useSpeechRecognition(micOn, (segment) => {
    setSpeechSegments((prev) => [...prev, segment]);
  });
  const [cameraOn, setCameraOn] = useState(true);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState<Record<number, string>>({});
  const [liveKitData, setLiveKitData] = useState<{ token: string; url: string } | null>(null);

  useEffect(() => {
    if (!id) return;

    async function startInterview() {
      try {
        console.log("Starting interview...");

        const res = await fetch(`/api/interviews/${id}/start`, {
          method: "POST",
        });

        console.log("Status:", res.status);

        const json = await res.json();

        console.log("Response:", json);

        if (json.success) {
          setLiveKitData(json.data);

          const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              interviewId: id,
            }),
          });

          const ai = await res.json();

          if (ai.success) {
            setAiQuestion(ai.question);

            setConversation([
              {
                role: "assistant",
                text: ai.question,
              },
            ]);
          }
        } else {
          console.error(json.message);
        }
      } catch (err) {
        console.error(err);
      }
    }

    startInterview();
  }, [id]);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const transcript = [
    ...speechSegments.map((text) => ({
      speaker: "You" as const,
      text,
    })),
    ...(liveSpeech
      ? [
        {
          speaker: "You" as const,
          text: liveSpeech,
        },
      ]
      : []),
  ];
  // Auto-scroll to the bottom of the transcript as new messages arrive
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [transcript]);

  const question = interviewQuestions[qIndex];

  const progress =
    ((qIndex + 1) / interviewQuestions.length) * 100;

  const submittedAnswer = submitted[qIndex];

const submitAnswer = async () => {
  if (!answer.trim()) return;

  setSubmitted((s) => ({
    ...s,
    [qIndex]: answer.trim(),
  }));

  const updatedConversation: typeof conversation = [
    ...conversation,
    {
      role: "user",
      text: answer,
    },
  ];

  setConversation(updatedConversation);

  const res = await fetch("/api/ai/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    interviewId: id,
    answer,
  }),
});

  const data = await res.json();

  if (data.success) {
    setAiQuestion(data.question);

    setConversation([
      ...updatedConversation,
      {
        role: "assistant",
        text: data.question,
      },
    ]);

    setAnswer("");
  }
};
  const editAnswer = () => {
    setAnswer(submitted[qIndex] ?? "");
    setSubmitted((s) => {
      const next = { ...s };
      delete next[qIndex];
      return next;
    });
  };

  const nextQuestion = () => {
    setAnswer("");
    setSpeechSegments([]);
    if (qIndex < interviewQuestions.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      endInterview();
    }
  };

  const endInterview = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`completed_interview_${id}`, "true");
    }
    router.replace(
      `/report/${id === "new" ? "int_001" : id}`
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border/60 px-4 sm:px-6">
        <Logo />

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="gap-1.5 rounded-full border-destructive/30 text-destructive"
          >
            <CircleDot className="h-3 w-3 animate-pulse" />
            Recording
          </Badge>

          <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-semibold tabular-nums">
            <Clock className="h-4 w-4 text-primary" />
            {timer}
          </span>

          <ThemeToggle />
        </div>
      </header>

      <div className="border-b border-border/60 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <span className="text-xs font-medium text-muted-foreground">
            Question {qIndex + 1} of {interviewQuestions.length}
          </span>

          <Progress value={progress} className="h-1.5 flex-1" />
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-6xl min-h-0 flex-1 gap-3 overflow-y-auto p-3 sm:p-4 lg:grid-cols-[240px_1fr_320px] lg:overflow-hidden">
        {/* AI Interviewer */}

        <Card className="flex flex-col items-center gap-4 border-border/60 p-6 text-center shadow-soft lg:h-full">
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
            }}
            className="grid h-20 w-20 place-items-center rounded-2xl gradient-primary shadow-elevated"
          >
            <Bot className="h-10 w-10 text-primary-foreground" />
          </motion.div>

          <div>
            <p className="font-semibold">
              AI Interviewer
            </p>

            <p className="text-xs text-muted-foreground">
              Senior Engineer Panel
            </p>
          </div>

          <Badge
            variant="secondary"
            className="gap-1.5 rounded-full"
          >
            <AudioLines className="h-3.5 w-3.5 text-primary" />
            Speaking
          </Badge>

          <div className="mt-2 w-full rounded-xl bg-muted/50 p-3 text-left text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI Tip
            </p>

            <p className="mt-1">
              Use the STAR method to structure your answer.
            </p>
          </div>
        </Card>

        {/* Center */}

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden lg:h-full">
          {/* Question Box */}
          <Card className="border-border/60 px-3.5 py-3 shadow-soft shrink-0">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0.5 text-[10px]"
              >
                {question.category}
              </Badge>
            </div>
            <h2 className="mt-1.5 font-display text-base font-bold leading-snug">
              {aiQuestion || "Preparing your interview..."}
            </h2>
          </Card>

          {/* Live Transcript Box */}
          <Card className="flex min-h-0 flex-1 flex-col border-border/60 shadow-soft">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 shrink-0">
              <span className="text-sm font-semibold">
                Live Transcript
              </span>

              <Badge
                variant="outline"
                className="gap-1.5 rounded-full text-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Speech-to-text
              </Badge>
            </div>

            <div
              ref={transcriptRef}
              className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin scroll-smooth"
            >
              {transcript.map((t, i) => (
                <div
                  key={i}
                  className={cn(
                    "group flex flex-col gap-1",
                    t.speaker === "You" && "items-end"
                  )}
                >
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t.speaker}
                  </span>

                  <p
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                      t.speaker === "You"
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {t.text}
                  </p>

                  {t.speaker === "You" && (
                    <div
                      className={cn(
                        "flex items-center gap-2.5 mt-1 px-1 transition-all duration-200",
                        submittedAnswer
                          ? "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                          : "opacity-100"
                      )}
                    >
                      <button
                        onClick={() => {
                          setAnswer(t.text);
                          setTimeout(() => {
                            const textarea = document.getElementById("answer-textarea");
                            if (textarea) {
                              (textarea as HTMLTextAreaElement).focus();
                            }
                          }, 50);
                        }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit in input box
                      </button>
                      <span className="text-muted-foreground/30 text-[10px]">|</span>
                      <button
                        onClick={() => {
                          setAnswer(t.text);
                          setSubmitted((s) => ({ ...s, [qIndex]: t.text }));
                        }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-success hover:text-success/80 transition-colors cursor-pointer"
                      >
                        <Check className="h-3 w-3" />
                        Confirm & Submit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Answer composer — review & edit before submitting */}
          <Card className="border-border/60 p-3 shadow-soft shrink-0">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Your Answer</span>
                {!submittedAnswer && (
                  <span className="text-[10px] text-muted-foreground">{answer.trim().length} chars</span>
                )}
              </div>

              {!submittedAnswer ? (
                <Button
                  size="sm"
                  className="h-7 rounded-lg gradient-primary px-3 text-[11px] text-primary-foreground"
                  onClick={submitAnswer}
                  disabled={!answer.trim()}
                >
                  <Send className="mr-1 h-3.5 w-3.5" /> Submit answer
                </Button>
              ) : (
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="h-7 rounded-lg px-2 text-[11px]" onClick={editAnswer}>
                    <Pencil className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button size="sm" className="h-7 rounded-lg gradient-primary px-2.5 text-[11px] text-primary-foreground" onClick={nextQuestion}>
                    Next <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {submittedAnswer ? (
              <p className="whitespace-pre-wrap rounded-lg bg-muted/40 p-2.5 text-xs leading-normal">{submittedAnswer}</p>
            ) : (
              <Textarea
                id="answer-textarea"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Review, edit, and refine your answer here before submitting…"
                className="h-16 min-h-[64px] resize-none rounded-lg p-2 text-xs leading-normal"
              />
            )}
          </Card>
        </div>
        {/* Right: camera + mic */}
        <div className="flex flex-col gap-3 lg:h-full">
          <Card className="overflow-hidden border-border/60 shadow-soft">
            <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/40">
              <div className="absolute inset-0">
                {liveKitData ? (
                  <LiveInterview
                    id={id}
                    token={liveKitData.token}
                    serverUrl={liveKitData.url}
                    micOn={micOn}
                    cameraOn={cameraOn}
                    screenShareOn={screenShareOn}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    Connecting...
                  </div>
                )}
              </div>

              <Badge
                variant="outline"
                className="absolute left-2 top-2 gap-1.5 rounded-full bg-background/80 text-xs backdrop-blur"
              >
                <CircleDot className="h-3 w-3 text-destructive" />
                Live
              </Badge>
            </div>

            <div className="space-y-2 p-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                <span className="text-muted-foreground">
                  Microphone
                </span>

                <span
                  className={cn(
                    "flex items-center gap-1 font-medium",
                    micOn
                      ? "text-success"
                      : "text-destructive"
                  )}
                >
                  {micOn ? (
                    <Mic className="h-3.5 w-3.5" />
                  ) : (
                    <MicOff className="h-3.5 w-3.5" />
                  )}

                  {micOn ? "Active" : "Muted"}
                </span>
              </div>

              <div className="flex items-end gap-0.5 px-1">
                {Array.from({ length: 24 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="flex-1 rounded-full bg-primary/70"
                    animate={{
                      height: micOn
                        ? [4, Math.random() * 22 + 4, 4]
                        : 3,
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8 + (i % 5) * 0.1,
                    }}
                  />
                ))}
              </div>
            </div>
          </Card>

          <Card className="grid grid-cols-3 gap-2 border-border/60 p-2.5 text-center shadow-soft">
            {[
              {
                label: "Confidence",
                value: "79%",
              },
              {
                label: "Eye Contact",
                value: "74%",
              },
              {
                label: "Posture",
                value: "81%",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg bg-muted/40 p-2"
              >
                <p className="font-display text-base font-bold">
                  {metric.value}
                </p>

                <p className="text-[10px] text-muted-foreground">
                  {metric.label}
                </p>
              </div>
            ))}
          </Card>
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Microphone Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={() => setMicOn((m) => !m)}
              aria-label="Toggle microphone"
            >
              {micOn ? (
                <Mic className="h-4 w-4 text-success" />
              ) : (
                <MicOff className="h-4 w-4 text-destructive" />
              )}
            </Button>

            {/* Video/Camera Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={() => setCameraOn((c) => !c)}
              aria-label="Toggle camera"
            >
              {cameraOn ? (
                <Video className="h-4 w-4 text-success" />
              ) : (
                <VideoOff className="h-4 w-4 text-destructive" />
              )}
            </Button>

            {/* Share Screen Toggle */}
            <Button
              variant="outline"
              size="icon"
              className={cn("rounded-xl", screenShareOn && "bg-primary/10 border-primary")}
              onClick={() => setScreenShareOn((s) => !s)}
              aria-label="Share screen"
            >
              <Monitor className={cn("h-4 w-4", screenShareOn ? "text-primary" : "text-muted-foreground")} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={nextQuestion}
            >
              <SkipForward className="mr-1.5 h-4 w-4" />
              Skip
            </Button>

            <Button
              className="rounded-xl gradient-primary text-primary-foreground"
              onClick={nextQuestion}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>

            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={endInterview}
            >
              <PhoneOff className="mr-1.5 h-4 w-4" />
              End
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}