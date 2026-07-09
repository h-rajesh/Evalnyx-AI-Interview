"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import speechRecognitionService from "@/services/speech-recognition.service";
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
  AlertTriangle,
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
import snapshotService from "@/services/snapshot.service";
import { useInterviewStore } from "@/stores/interview-store";
import interviewOrchestrator from "@/services/interview-orchestrator.service";
import { InterviewState } from "@/types/interview-state";
import aiSpeechService from "@/services/ai-speech.service";
import interviewSession from "@/services/interview-session.service";

function useTimer(active: boolean) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [active]);


  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return `${mm}:${ss}`;
}

export default function InterviewRoom() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const state = useInterviewStore((s) => s.state);
  const transcript = useInterviewStore((s) => s.transcript);
  const question = useInterviewStore((s) => s.question);
  const questionNumber = useInterviewStore((s) => s.questionNumber);
  const totalQuestions = useInterviewStore((s) => s.totalQuestions);

  useEffect(() => {
    aiSpeechService.init();
    return () => {
      aiSpeechService.stop();
      speechRecognitionService.stop();
    };
  }, []);

  useEffect(() => {
    return interviewOrchestrator.subscribe(
      (state) => {
        console.log(state);
      }
    );
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isCompleted = localStorage.getItem(`completed_interview_${id}`);
      if (isCompleted === "true") {
        router.replace("/dashboard");
      }
    }
  }, [id, router]);

  const [isStarted, setIsStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [startError, setStartError] = useState<string | null>(null);
  const timer = useTimer(isStarted);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const [liveKitData, setLiveKitData] = useState<{ token: string; url: string } | null>(null);
  const startRequestedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id || !isStarted) return;
    if (startRequestedRef.current === id) return;
    startRequestedRef.current = id;

    async function startInterview() {
      try {
        console.log("Starting interview...");

        const res = await fetch(`/api/interviews/${id}/start`, {
          method: "POST",
        });

        console.log("Status:", res.status);

        if (!res.ok) {
          const text = await res.text();
          let msg = "Failed to start interview.";
          try {
            const parsed = JSON.parse(text);
            msg = parsed.message || msg;
          } catch {
            msg = `Server returned status ${res.status}`;
          }
          setStartError(msg);
          return;
        }

        const json = await res.json();

        console.log("Response:", json);

        if (json.success) {
          setLiveKitData(json.data);
          await interviewSession.start(id);
        } else {
          setStartError(json.message || "Failed to start interview.");
        }
      } catch (err: any) {
        console.error(err);
        setStartError(err.message || "A network error occurred. Please check your connection.");
      }
    }

    startInterview();
  }, [id, isStarted]);

  const transcriptRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the transcript as new messages arrive
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [transcript]);

  const progress = (questionNumber / totalQuestions) * 100;

  const questionCategory = interviewQuestions[questionNumber - 1]?.category || "General";



  const endInterview = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`completed_interview_${id}`, "true");
    }
    snapshotService.stop();
    aiSpeechService.stop();
    speechRecognitionService.stop();
    router.replace(
      `/report/${id === "new" ? "int_001" : id}`
    );
  };

  if (!isStarted) {
    return (
      <div className="flex min-h-screen flex-col bg-background overflow-y-auto">
        <header className="flex h-16 items-center justify-between border-b border-border/60 px-4 sm:px-6 shrink-0">
          <Logo />
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-4xl grid gap-6 md:grid-cols-2">
            
            {/* Left Column: Camera Preview and Mic wave */}
            <Card className="border-border/60 shadow-soft overflow-hidden flex flex-col h-[380px] md:h-[450px]">
              <div className="relative flex-1 bg-gradient-to-br from-muted to-muted/40 overflow-hidden">
                {cameraOn ? (
                  <CameraPreview />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                    <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                      <VideoOff className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Camera feed disabled</span>
                  </div>
                )}
                
                <Badge
                  variant="outline"
                  className="absolute left-3 top-3 gap-1.5 rounded-full bg-background/80 text-xs backdrop-blur font-semibold"
                >
                  <CircleDot className="h-3 w-3 text-primary animate-pulse" />
                  Preview
                </Badge>
              </div>

              <div className="p-4 border-t border-border/60 flex items-center justify-between bg-muted/20 shrink-0">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl h-10 w-10 border-border/80"
                    onClick={() => setCameraOn((c) => !c)}
                    aria-label="Toggle camera preview"
                  >
                    {cameraOn ? (
                      <Video className="h-4 w-4 text-success" />
                    ) : (
                      <VideoOff className="h-4 w-4 text-destructive" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl h-10 w-10 border-border/80"
                    onClick={() => setMicOn((m) => !m)}
                    aria-label="Toggle microphone preview"
                  >
                    {micOn ? (
                      <Mic className="h-4 w-4 text-success" />
                    ) : (
                      <MicOff className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Mic: {micOn ? "Active" : "Muted"}
                  </span>
                  {micOn && (
                    <div className="flex items-end gap-0.5 h-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <motion.span
                          key={i}
                          className="w-0.5 rounded-full bg-primary/70"
                          animate={{
                            height: [2, Math.random() * 8 + 2, 2]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.5 + (i % 3) * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Right Column: Information, Guidelines, and Start Button */}
            <Card className="border-border/60 shadow-soft p-6 flex flex-col justify-between h-[380px] md:h-[450px]">
              <div className="space-y-4">
                <div>
                  <Badge variant="secondary" className="rounded-full font-semibold px-3 py-1 mb-2">
                    Evaluation Setup
                  </Badge>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                    AI Interview Lobby
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please ensure your camera and microphone are properly configured before starting.
                  </p>
                </div>

                <div className="space-y-3 rounded-xl bg-muted/40 p-4 border border-border/30">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Interview Guidelines
                  </h3>
                  
                  <ul className="space-y-2 text-[11px] text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span><strong>Fullscreen Mode Required:</strong> Exiting fullscreen will trigger warnings.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span><strong>Proctoring Monitor:</strong> Browser window focus, switching tabs, or camera presence is tracked.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span><strong>Warning Limit:</strong> 3 fullscreen exit violations will result in automatic termination of the interview.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2 shrink-0">
                <Button
                  className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-elevated hover:opacity-95 transition-all text-sm"
                  onClick={async () => {
                    try {
                      if (!document.fullscreenElement) {
                        await document.documentElement.requestFullscreen();
                      }
                      setIsFullscreen(true);
                    } catch (err) {
                      console.error("Failed to request fullscreen:", err);
                    }
                    setIsStarted(true);
                    interviewOrchestrator.transition(
                      InterviewState.GENERATING_QUESTION
                    );
                  }}
                >
                  Start Interview <ChevronRight className="h-4 w-4" />
                </Button>
                <p className="text-center text-[10px] text-muted-foreground">
                  By starting, you consent to locally process camera & audio for evaluation.
                </p>
              </div>
            </Card>

          </div>
        </main>
      </div>
    );
  }

  if (startError) {
    return (
      <div className="flex min-h-screen flex-col bg-background overflow-y-auto">
        <header className="flex h-16 items-center justify-between border-b border-border/60 px-4 sm:px-6 shrink-0">
          <Logo />
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/60 bg-card p-8 shadow-elevated text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Failed to Start Interview</h2>
              <p className="text-sm text-muted-foreground leading-normal">
                {startError}
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full rounded-xl h-11"
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(console.error);
                  }
                  router.replace("/dashboard");
                }}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {!isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-lg px-4 text-center">
          <div className="max-w-md space-y-6 rounded-2xl border border-border/60 bg-card p-8 shadow-elevated">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-8 w-8 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight">Fullscreen Required</h2>
              <p className="text-sm text-muted-foreground">
                This interview requires you to remain in fullscreen mode. Click below to resume.
              </p>
            </div>

            <Button
              className="w-full rounded-xl gradient-primary text-primary-foreground font-semibold py-3 flex items-center justify-center gap-2 shadow-elevated"
              onClick={async () => {
                try {
                  if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                  }
                  setIsFullscreen(true);
                } catch (err) {
                  console.error("Failed to re-enter fullscreen:", err);
                }
              }}
            >
              Resume Fullscreen
            </Button>
          </div>
        </div>
      )}
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

          <Badge variant="secondary" className="rounded-full">
            {state}
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
            Question {questionNumber} of {totalQuestions}
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
                {questionCategory}
              </Badge>
            </div>
            <h2 className="mt-1.5 font-display text-base font-bold leading-snug">
              {question || "Preparing your interview..."}
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
              className="flex-1 overflow-y-auto p-6 scrollbar-thin scroll-smooth flex items-center justify-center text-center bg-muted/10"
            >
              <p className="text-lg font-medium text-foreground/80 leading-relaxed max-w-md animate-pulse">
                {transcript || "Listening..."}
              </p>
            </div>
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
                    onViolationLimitReached={endInterview}
                    onFullscreenChange={setIsFullscreen}
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