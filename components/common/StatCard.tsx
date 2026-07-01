import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  trend = "up",
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon?: LucideIcon;
}) {
  return (
    <Card className="overflow-hidden border-border/60 shadow-soft transition-shadow hover:shadow-elevated">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon && (
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="mt-3 flex items-end justify-between">
          <span className="font-display text-3xl font-bold tracking-tight">{value}</span>
          {change && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-semibold",
                trend === "up" ? "text-success" : "text-destructive",
              )}
            >
              {trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
