import Link from "next/link";
import { MotionDiv } from "@/components/common/Motion";
import {
  PlusCircle,
  History,
  Trophy,
  Clock,
  Activity,
  BarChart3,
  Upload,
  FileText,
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

import {
  stats,
  recentInterviews,
} from "@/lib/mock-data";
import { DashboardGreeting } from "@/components/features/DashboardGreeting";
import { DashboardResumeCard } from "@/components/features/DashboardResumeCard";

const statIcons = [Trophy, Target, Clock, Activity];

export default async function DashboardPage() {
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
        {stats.map((s, i) => (
          <StatCard
            key={s.label}
            {...s}
            icon={statIcons[i]}
          />
        ))}
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
            <PerformanceChart />
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
            {recentInterviews.slice(0, 4).map((it) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}