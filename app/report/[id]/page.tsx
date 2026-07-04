"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
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

import { reportData } from "@/lib/mock-data";

const metrics = [
  {
    label: "Technical",
    value: reportData.technical,
    suffix: "%",
    icon: Gauge,
  },
  {
    label: "Communication",
    value: reportData.communication,
    suffix: "%",
    icon: TrendingUp,
  },
  {
    label: "Confidence",
    value: reportData.confidence,
    suffix: "%",
    icon: Sparkles,
  },
  {
    label: "Grammar",
    value: reportData.grammar,
    suffix: "%",
    icon: SpellCheck,
  },
  {
    label: "Eye Contact",
    value: reportData.eyeContact,
    suffix: "%",
    icon: Eye,
  },
  {
    label: "Posture",
    value: reportData.posture,
    suffix: "%",
    icon: Activity,
  },
  {
    label: "Speaking Speed",
    value: reportData.speakingSpeed,
    suffix: " wpm",
    icon: Activity,
  },
  {
    label: "Filler Words",
    value: reportData.fillerWords,
    suffix: "",
    icon: MessageSquareWarning,
  },
];

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;

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
                  value={reportData.overall}
                  size={150}
                  stroke={12}
                  label="Overall"
                />
              </div>

              <div className="space-y-3 text-center sm:text-left">
                <Badge variant="secondary" className="rounded-full">
                  Senior Frontend Engineer · Technical
                </Badge>

                <h1 className="font-display text-2xl font-bold sm:text-3xl">
                  Great performance! 🎉
                </h1>

                <p className="text-sm text-muted-foreground">
                  You scored higher than 82% of candidates at this level.
                  Your technical depth and clarity stood out.
                </p>

                <div className="flex flex-wrap justify-center gap-4 pt-1 sm:justify-start">
                  <span className="text-sm">
                    <span className="font-display text-lg font-bold text-success">
                      {reportData.technical}%
                    </span>{" "}
                    <span className="text-muted-foreground">
                      Technical
                    </span>
                  </span>

                  <span className="text-sm">
                    <span className="font-display text-lg font-bold text-primary">
                      {reportData.communication}%
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
              {reportData.strengths.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 text-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{item}</span>
                </div>
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
              {reportData.weaknesses.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 text-sm"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Suggested Answers */}
        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-primary" />
              Suggested Answers
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {reportData.suggestedAnswers.map((answer) => (
              <div
                key={answer.q}
                className="rounded-xl border border-border/60 bg-muted/30 p-4"
              >
                <p className="text-sm font-semibold">
                  {answer.q}
                </p>

                <p className="mt-1.5 text-sm text-muted-foreground">
                  {answer.a}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
                {/* Learning Roadmap */}
        <Card className="border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Map className="h-4 w-4 text-primary" />
              Learning Roadmap
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {reportData.roadmap.map((item, index) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-border/60 p-4"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full gradient-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {item.title}
                    </p>

                    <Badge
                      variant="secondary"
                      className="rounded-full text-xs"
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

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