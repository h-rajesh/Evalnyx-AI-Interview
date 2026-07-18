"use client";

import Link from "next/link";
import { MotionDiv } from "@/components/common/Motion";
import {
  PlusCircle,
  History,
  Trophy,
  Clock,
  Activity,
  BarChart3,
  ArrowRight,
  Target,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { StatCard } from "@/components/common/StatCard";
import { PerformanceChart } from "@/components/features/PerformanceChart";
import {
  ScoreBadge,
  StatusBadge,
} from "@/components/features/InterviewBadges";

import { useDashboard } from "@/hooks/useDashboard";
import { DashboardGreeting } from "@/components/features/DashboardGreeting";
import { DashboardResumeCard } from "@/components/features/DashboardResumeCard";

const statIcons = [Trophy, Target, Clock, Activity];

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const dashboard = data?.dashboard;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-48 rounded-2xl bg-muted/60" />
        
        {/* Stats Grid Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/60" />
          ))}
        </div>

        {/* Charts & Resume Card Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-[350px] rounded-xl bg-muted/60 lg:col-span-2" />
          <div className="h-[350px] rounded-xl bg-muted/60" />
        </div>

        {/* Recent Interviews Skeleton */}
        <div className="h-[250px] rounded-xl bg-muted/60" />
      </div>
    );
  }

  const recentInterviewsMapped = (dashboard?.recentInterviews || []).slice(0, 4).map((it: any) => {
    const difficulty = it.difficulty
      ? it.difficulty.charAt(0).toUpperCase() + it.difficulty.slice(1).toLowerCase()
      : "";
    
    const type = it.interviewType
      ? it.interviewType.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
      : "";

    const date = it.createdAt
      ? new Date(it.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

    let status: "completed" | "in-progress" | "scheduled" = "completed";
    if (it.status === "SCHEDULED" || it.status === "scheduled") {
      status = "scheduled";
    } else if (it.status === "IN_PROGRESS" || it.status === "in-progress") {
      status = "in-progress";
    }

    const score = it.report?.overallScore ?? it.score ?? 0;

    return {
      id: it.id,
      role: it.jobRole || it.title,
      type,
      difficulty,
      date,
      status,
      score,
    };
  });

  return (
    <div className="space-y-8">
      <MotionDiv
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 gradient-primary p-6 text-primary-foreground shadow-elevated sm:p-8"
      >
        <div className="relative z-10 max-w-xl">
          <DashboardGreeting />

          <p className="mt-2 text-sm opacity-90">
            You're on a 6-week improvement streak. Ready to sharpen your
            skills with another mock interview?
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="rounded-xl"
            >
              <Link href="/dashboard/new">
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Start Interview
              </Link>
            </Button>

            <Button
              asChild
              size="sm"
              variant="secondary"
              className="rounded-xl bg-white/15 text-primary-foreground hover:bg-white/25"
            >
              <Link href="/dashboard/interviews">
                <History className="mr-1.5 h-4 w-4" />
                View History
              </Link>
            </Button>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </MotionDiv>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Interviews Taken"
          value={dashboard?.interviewCount !== undefined ? `${dashboard.interviewCount}` : "0"}
          change="+12%"
          trend="up"
          icon={statIcons[0]}
        />
        <StatCard
          label="Average Score"
          value={dashboard?.averageScore !== undefined ? `${dashboard.averageScore}%` : "0%"}
          change="+5%"
          trend="up"
          icon={statIcons[1]}
        />
        <StatCard
          label="Practice Hours"
          value={dashboard?.practiceHours !== undefined ? `${dashboard.practiceHours}` : "0"}
          change="+3.2h"
          trend="up"
          icon={statIcons[2]}
        />
        <StatCard
          label="Confidence"
          value="High"
          change="Improving"
          trend="up"
          icon={statIcons[3]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 shadow-soft lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                Performance Over Time
              </CardTitle>

              <CardDescription>
                Overall and communication scores
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <PerformanceChart data={dashboard?.performance} />
          </CardContent>
        </Card>

        <DashboardResumeCard />
      </div>

      <Card className="border-border/60 shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            Recent Interviews
          </CardTitle>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-lg text-muted-foreground"
          >
            <Link href="/dashboard/interviews">
              View all
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {recentInterviewsMapped.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
                No recent interviews yet.
              </div>
            ) : (
              recentInterviewsMapped.map((it: any) => (
                <Link
                  key={it.id}
                  href={`/report/${it.id}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {it.role}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {it.type} · {it.difficulty} · {it.date}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <StatusBadge status={it.status} />

                    {it.status === "completed" && (
                      <ScoreBadge score={it.score} />
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}