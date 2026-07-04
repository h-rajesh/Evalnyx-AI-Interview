"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  History,
  PlusCircle,
  Clock,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  ScoreBadge,
  StatusBadge,
} from "@/components/features/InterviewBadges";

import { recentInterviews } from "@/lib/mock-data";

export default function InterviewsPage() {
  const [query, setQuery] = useState("");

  const filtered = recentInterviews.filter((interview) =>
    `${interview.role} ${interview.type} ${interview.difficulty}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview History"
        description="Review past sessions and track your improvement."
        actions={
          <Button
            asChild
            className="rounded-xl gradient-primary text-primary-foreground"
          >
            <Link href="/dashboard/new">
              <PlusCircle className="mr-1.5 h-4 w-4" />
              New
            </Link>
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search interviews..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-xl pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No interviews found"
          description="Try a different search, or start a new mock interview."
          action={
            <Button asChild className="rounded-xl">
              <Link href="/dashboard/new">
                Start Interview
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((interview) => (
            <Card
              key={interview.id}
              className="border-border/60 shadow-soft transition-shadow hover:shadow-elevated"
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold">
                      {interview.role}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {interview.date}
                    </p>
                  </div>

                  <StatusBadge status={interview.status} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-full"
                  >
                    {interview.type}
                  </Badge>

                  <Badge
                    variant="secondary"
                    className="rounded-full"
                  >
                    {interview.level}
                  </Badge>

                  <Badge
                    variant="secondary"
                    className="rounded-full"
                  >
                    {interview.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {interview.durationMin} min
                  </span>

                  {interview.status === "completed" ? (
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="rounded-lg"
                    >
                      <Link href={`/report/${interview.id}`}>
                        <span className="flex items-center gap-2">
                          View Report
                          <ScoreBadge score={interview.score} />
                        </span>
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-lg"
                    >
                      <Link href={`/interview/${interview.id}`}>
                        Start
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}