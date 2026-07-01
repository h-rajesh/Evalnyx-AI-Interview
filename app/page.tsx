"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Mic,
  Eye,
  Activity,
  AudioLines,
  SpellCheck,
  MessageSquareWarning,
  Lightbulb,
  Gauge,
  Video,
  Star,
} from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const aiFeatures = [
  {
    icon: Brain,
    title: "AI Question Generator",
    desc: "Role-specific questions tailored to your resume and experience level.",
  },
  {
    icon: Mic,
    title: "Speech-to-Text",
    desc: "Live transcription of every answer as you speak.",
  },
  {
    icon: Gauge,
    title: "Answer Analysis",
    desc: "Depth, relevance, and structure scoring for each response.",
  },
  {
    icon: Activity,
    title: "Posture Analysis",
    desc: "Body-language insights captured throughout the session.",
  },
  {
    icon: Eye,
    title: "Eye Contact",
    desc: "Track focus and engagement with the camera.",
  },
  {
    icon: AudioLines,
    title: "Voice Analysis",
    desc: "Pace, tone, and clarity of your delivery.",
  },
  {
    icon: Sparkles,
    title: "Confidence Score",
    desc: "An overall measure of composure under pressure.",
  },
  {
    icon: SpellCheck,
    title: "Grammar Analysis",
    desc: "Catch grammar slips and refine your phrasing.",
  },
  {
    icon: MessageSquareWarning,
    title: "Filler Word Detection",
    desc: "Spot 'um', 'like', and other crutch words.",
  },
  {
    icon: Lightbulb,
    title: "Learning Suggestions",
    desc: "A personalized roadmap to improve faster.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button
              asChild
              variant="ghost"
              className="hidden rounded-xl sm:inline-flex"
            >
              <Link href="/login">Sign in</Link>
            </Button>

            <Button
              asChild
              className="rounded-xl gradient-primary text-primary-foreground"
            >
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge
              variant="secondary"
              className="rounded-full px-4 py-1.5 text-xs"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Your personal AI interview coach
            </Badge>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Ace your next interview with{" "}
              <span className="gradient-text">AI-powered</span> practice
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Run realistic mock interviews, get instant feedback on every
              answer, and track your progress until you're ready to land the
              offer.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-xl gradient-primary text-primary-foreground"
              >
                <Link href="/register">
                  Start practicing
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link href="/dashboard">View demo dashboard</Link>
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-warning text-warning"
                  />
                ))}
              </div>

              Loved by 12,000+ candidates
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Everything you need to improve
          </h2>

          <p className="mt-2 text-muted-foreground">
            Ten AI-driven insights from a single interview session.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aiFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.05 }}
            >
              <Card className="h-full border-border/60 shadow-soft transition-shadow hover:shadow-elevated">
                <CardContent className="space-y-3 p-6">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <feature.icon className="h-5 w-5" />
                  </div>

                  <h3 className="font-semibold">{feature.title}</h3>

                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Card className="overflow-hidden border-border/60 gradient-primary text-primary-foreground shadow-elevated">
          <CardContent className="flex flex-col items-center gap-6 p-10 text-center sm:p-14">
            <Video className="h-10 w-10" />

            <h2 className="max-w-xl font-display text-3xl font-bold">
              Ready for your first mock interview?
            </h2>

            <p className="max-w-md text-sm opacity-90">
              Set up a tailored session in under a minute. No credit card
              required.
            </p>

            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-xl"
            >
              <Link href="/register">
                Create free account
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Logo />
          <p>© 2026 MockMind. Built for ambitious candidates.</p>
        </div>
      </footer>
    </div>
  );
}