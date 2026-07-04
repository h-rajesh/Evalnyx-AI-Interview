import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-primary shadow-soft">
        <Brain className="h-5 w-5 text-primary-foreground" />
      </div>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight">
          Eval<span className="gradient-text">ynx</span>
        </span>
      )}
    </div>
  );
}
