"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Mic,
  MicOff,
  Video,
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

  const [qIndex, setQIndex] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState<Record<number, string>>({});

  const transcriptRef = useRef<HTMLDivElement>(null);

  const question = interviewQuestions[qIndex];

  const progress =
    ((qIndex + 1) / interviewQuestions.length) * 100;

  const submittedAnswer = submitted[qIndex];

  const submitAnswer = () => {
    if (!answer.trim()) return;
    setSubmitted((s) => ({ ...s, [qIndex]: answer.trim() }));
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

      <main className="mx-auto grid w-full max-w-6xl min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[260px_1fr_280px] lg:overflow-hidden">
        {/* AI Interviewer */}

        <Card className="flex flex-col items-center gap-4 border-border/60 p-6 text-center shadow-soft">
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

        <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <Card className="border-border/60 p-6 shadow-soft">
            <Badge
              variant="secondary"
              className="rounded-full"
            >
              {question.category}
            </Badge>

            <h2 className="mt-3 font-display text-xl font-bold leading-snug">
              {question.prompt}
            </h2>
          </Card>

          <Card className="flex min-h-0 flex-1 flex-col border-border/60 shadow-soft">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
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
              className="flex-1 space-y-4 overflow-y-auto p-4"
            >
              {liveTranscript.map((t, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col gap-1",
                    t.speaker === "You" && "items-end"
                  )}
                >
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t.speaker}
                  </span>

                  <p
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      t.speaker === "You"
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {t.text}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Answer composer — review & edit before submitting */}
          <Card className="border-border/60 p-4 shadow-soft">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Your Answer</span>
              {submittedAnswer ? (
                <Badge variant="outline" className="gap-1.5 rounded-full text-xs text-success">
                  <Check className="h-3.5 w-3.5" /> Submitted
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">{answer.trim().length} chars</span>
              )}
            </div>

            {submittedAnswer ? (
              <div className="space-y-3">
                <p className="whitespace-pre-wrap rounded-xl bg-muted/50 p-3 text-sm">{submittedAnswer}</p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="rounded-xl" onClick={editAnswer}>
                    <Pencil className="mr-1.5 h-4 w-4" /> Edit answer
                  </Button>
                  <Button className="rounded-xl gradient-primary text-primary-foreground" onClick={nextQuestion}>
                    Next question <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Review, edit, and refine your answer here before submitting…"
                  className="min-h-[120px] resize-none rounded-xl"
                />
                <div className="flex justify-end">
                  <Button
                    className="rounded-xl gradient-primary text-primary-foreground"
                    onClick={submitAnswer}
                    disabled={!answer.trim()}
                  >
                    <Send className="mr-1.5 h-4 w-4" /> Submit answer
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
              {/* Right: camera + mic */}
        <div className="flex flex-col gap-4">
          <Card className="overflow-hidden border-border/60 shadow-soft">
            <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/40">
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Video className="h-8 w-8" />
                  <span className="mt-2 text-xs">Camera Preview</span>
                </div>
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

          <Card className="grid grid-cols-3 gap-2 border-border/60 p-3 text-center shadow-soft">
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
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => setMicOn((m) => !m)}
            aria-label="Toggle microphone"
          >
            {micOn ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
          </Button>

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