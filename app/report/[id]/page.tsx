"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useInterviewReport } from "@/hooks/useInterviewReport";
import {
  ArrowLeft,
  Download,
  Share2,
  Eye,
  Activity,
  Gauge,
  SpellCheck,
  MessageSquareWarning,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Map,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { ScoreRing } from "@/components/common/ScoreRing";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import QuestionReview from "@/components/report/QuestionReview";
import LearningRoadmap from "@/components/report/LearningRoadmap";
import SuggestedAnswers from "@/components/report/SuggestedAnswers";
import ReplayTimeline from "@/components/report/ReplayTimeline";

import { reportData } from "@/lib/mock-data";

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, error } = useInterviewReport(id);
  const report = data?.report;
  const replay = data?.replay;

  if (isLoading) {
    return (
      <div className="p-10">
        Loading Report...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-10 text-red-500">
        Failed to load report.
      </div>
    );
  }

  const snapshots = report.interview?.behaviorSnapshots || [];
  const evaluations = report.interview?.evaluations || [];

  // 1. Average Speaking Speed (WPM)
  const totalWords = evaluations.reduce((sum: number, e: any) => sum + (e.answer || "").split(/\s+/).filter(Boolean).length, 0);
  const speakingSeconds = snapshots.filter((s: any) => s.speaking).length;
  const speakingMinutes = speakingSeconds / 60;
  const speakingSpeed = speakingMinutes > 0 ? Math.round(totalWords / speakingMinutes) : 130;

  // 2. Filler Words
  const countFillers = (text: string) => {
    const fillers = ["um", "uh", "like", "actually", "basically", "you know", "kind of", "sort of", "i mean"];
    const lower = (text || "").toLowerCase();
    let count = 0;
    fillers.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, "g");
      const matches = lower.match(regex);
      if (matches) count += matches.length;
    });
    return count;
  };
  const fillerCount = evaluations.reduce((sum: number, e: any) => sum + countFillers(e.answer), 0);

  // 3. Eye Contact
  const avgEyeContact = snapshots.length > 0
    ? Math.round(snapshots.reduce((sum: number, s: any) => sum + s.eyeContact, 0) / snapshots.length)
    : 90;

  // 4. Pauses & Longest Pause
  let pauseCount = 0;
  let longestPause = 0;
  let currentPause = 0;
  let everSpoke = false;
  snapshots.forEach((s: any) => {
    if (s.speaking) {
      everSpoke = true;
      currentPause = 0;
    } else if (everSpoke) {
      if (currentPause === 0) {
        pauseCount++;
      }
      currentPause++;
      longestPause = Math.max(longestPause, currentPause);
    }
  });

  // 5. Speaking Ratio
  const speakingRatio = snapshots.length > 0
    ? Math.round((snapshots.filter((s: any) => s.speaking).length / snapshots.length) * 100)
    : 70;

  // 6. Voice Energy
  const avgVolume = snapshots.length > 0
    ? snapshots.reduce((sum: number, s: any) => sum + s.voiceVolume, 0) / snapshots.length
    : 0.25;
  const voiceEnergy = Math.round(Math.min(100, avgVolume * 100));

  const metrics = [
    {
      label: "Technical",
      value: report.technicalScore,
      suffix: "%",
      icon: Gauge,
    },
    {
      label: "Communication",
      value: report.communicationScore,
      suffix: "%",
      icon: TrendingUp,
    },
    {
      label: "Confidence",
      value: report.confidenceScore,
      suffix: "%",
      icon: Sparkles,
    },
    {
      label: "Speaking Ratio",
      value: speakingRatio,
      suffix: "%",
      icon: Activity,
    },
    {
      label: "Eye Contact",
      value: avgEyeContact,
      suffix: "%",
      icon: Eye,
    },
    {
      label: "Voice Energy",
      value: voiceEnergy,
      suffix: "%",
      icon: Activity,
    },
    {
      label: "Speaking Speed",
      value: speakingSpeed,
      suffix: " wpm",
      icon: Activity,
    },
    {
      label: "Filler Words",
      value: fillerCount,
      suffix: "",
      icon: MessageSquareWarning,
    },
  ];

  return (
    <div className="min-h-screen bg-background">



      {/* Header */}

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6">

        <div className="flex items-center gap-3">

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-xl"
          >
            <Link href="/dashboard/interviews">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <Logo />

        </div>

        <div className="flex items-center gap-2">

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() =>
              toast.success("Report shared", {
                description: "Link copied to clipboard.",
              })
            }
          >
            <Share2 className="mr-1.5 h-4 w-4" />
            Share
          </Button>

          <Button
            size="sm"
            className="rounded-xl gradient-primary text-primary-foreground"
            onClick={() =>
              toast.success("Downloading PDF...")
            }
          >
            <Download className="mr-1.5 h-4 w-4" />
            PDF
          </Button>

          <ThemeToggle />

        </div>

      </header>

      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6">
                {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden border-border/60 shadow-elevated">
            <CardContent className="grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
              <div className="flex justify-center">
                <ScoreRing
                  value={report.overallScore}
                  size={150}
                  stroke={12}
                  label="Overall"
                />
              </div>

              <div className="space-y-3 text-center sm:text-left">
                <Badge variant="secondary" className="rounded-full">
                  {report.interview.jobRole} · {report.interview.interviewType}
                </Badge>

                <h1 className="font-display text-2xl font-bold sm:text-3xl">
                  {report.recommendation}
                </h1>

                <p className="text-sm text-muted-foreground">
                  {report.summary}
                </p>

                <div className="flex flex-wrap justify-center gap-4 pt-1 sm:justify-start">
                  <span className="text-sm">
                    <span className="font-display text-lg font-bold text-success">
                      {report.technicalScore}%
                    </span>{" "}
                    <span className="text-muted-foreground">
                      Technical
                    </span>
                  </span>

                  <span className="text-sm">
                    <span className="font-display text-lg font-bold text-primary">
                      {report.communicationScore}%
                    </span>{" "}
                    <span className="text-muted-foreground">
                      Communication
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="border-border/60 shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </span>

                    <metric.icon className="h-4 w-4 text-primary" />
                  </div>

                  <p className="mt-2 font-display text-2xl font-bold">
                    {metric.value}
                    {metric.suffix}
                  </p>

                  {metric.suffix === "%" && (
                    <Progress
                      value={metric.value}
                      className="mt-3 h-1.5"
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Voice Insights */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border/60 shadow-soft">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Longest Pause</p>
                <p className="mt-2 font-display text-2xl font-bold">{longestPause}s</p>
              </div>
              <Activity className="h-6 w-6 text-primary opacity-85" />
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-soft">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Number of Pauses</p>
                <p className="mt-2 font-display text-2xl font-bold">{pauseCount}</p>
              </div>
              <MessageSquareWarning className="h-6 w-6 text-primary opacity-85" />
            </CardContent>
          </Card>
        </div>

        <QuestionReview
          evaluations={report.interview.evaluations}
        />

        {/* Strengths & Weaknesses */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-success">
                <CheckCircle2 className="h-4 w-4" />
                Strengths
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {report.strengths?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-warning">
                <AlertTriangle className="h-4 w-4" />
                Areas to Improve
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {report.weaknesses?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </CardContent>
          </Card>
        </div>

        <LearningRoadmap
          items={(report.learningRoadmap as any) ?? []}
        />

        <SuggestedAnswers
          answers={(report.suggestedAnswers as any) ?? []}
        />

        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="text-2xl font-bold">
            Career Advice
          </h2>

          <p className="text-muted-foreground">
            {report.careerAdvice}
          </p>

          <div className="pt-4 border-t">
            <span className="font-medium">Recommended Next Difficulty:</span>{" "}
            <span className="font-semibold">
              {report.nextInterviewDifficulty}
            </span>
          </div>
        </div>

        <ReplayTimeline
          events={replay?.timeline ?? []}
        />

        {/* Footer Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            asChild
            variant="outline"
            className="rounded-xl"
          >
            <Link href="/dashboard">
              Back to Dashboard
            </Link>
          </Button>

          <Button
            asChild
            className="rounded-xl gradient-primary text-primary-foreground"
          >
            <Link href="/dashboard/new">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Practice Again
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}