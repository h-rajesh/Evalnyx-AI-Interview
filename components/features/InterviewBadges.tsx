import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InterviewSummary } from "@/lib/mock-data";

const scoreColor = (s: number) =>
  s >= 85 ? "text-success" : s >= 70 ? "text-warning" : "text-destructive";

export function ScoreBadge({ score }: { score: number }) {
  return <span className={cn("font-display text-sm font-bold", scoreColor(score))}>{score}%</span>;
}

export function StatusBadge({ status }: { status: InterviewSummary["status"] }) {
  const map: Record<InterviewSummary["status"], { label: string; cls: string }> = {
    completed: { label: "Completed", cls: "bg-success/15 text-success border-success/20" },
    "in-progress": { label: "In progress", cls: "bg-warning/15 text-warning border-warning/20" },
    scheduled: { label: "Scheduled", cls: "bg-accent text-accent-foreground border-border" },
  };
  const v = map[status];
  return <Badge variant="outline" className={cn("rounded-full font-medium", v.cls)}>{v.label}</Badge>;
}
