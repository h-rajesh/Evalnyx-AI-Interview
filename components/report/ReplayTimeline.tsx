"use client";

import { useState } from "react";

interface TimelineEvent {
  id: string;
  timestamp: number;
  type: string;
  data?: any;
}

interface Props {
  events: TimelineEvent[];
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

export default function ReplayTimeline({
  events,
}: Props) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Helper to format event types into friendly titles
  const formatType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-2xl font-bold">
          Interview Replay Timeline
        </h2>
        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
          {events.length} events
        </span>
      </div>

      <div className="relative border-l-2 border-muted pl-6 ml-4 space-y-6">
        {events.map((event) => {
          const isSelected = selectedEventId === event.id;
          const hasData = event.data && Object.keys(event.data).length > 0;

          return (
            <div
              key={event.id}
              onClick={() => setSelectedEventId(isSelected ? null : event.id)}
              className={`relative group cursor-pointer transition-all duration-200 p-4 rounded-xl border ${
                isSelected
                  ? "bg-muted/50 border-primary shadow-sm"
                  : "bg-card border-transparent hover:bg-muted/20 hover:border-border"
              }`}
            >
              {/* Timeline dot marker */}
              <div className={`absolute -left-[31px] top-6 w-3 h-3 rounded-full border-2 transition-all duration-200 ${
                isSelected
                  ? "bg-primary border-primary scale-125"
                  : "bg-background border-muted group-hover:border-primary"
              }`} />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="font-mono text-sm text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                    {formatTime(event.timestamp)}
                  </div>
                  <div className="font-semibold text-foreground">
                    {formatType(event.type)}
                  </div>
                </div>

                {hasData && !isSelected && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    Click to view details
                  </span>
                )}
              </div>

              {isSelected && hasData && (
                <div className="mt-4 pt-3 border-t border-border/60 text-sm text-muted-foreground space-y-2">
                  {event.data.question && (
                    <div>
                      <span className="font-semibold text-foreground block mb-1">Question:</span>
                      <p className="bg-background/80 p-2.5 rounded-lg border border-border/40 font-medium">
                        {event.data.question}
                      </p>
                    </div>
                  )}
                  {event.data.answer && (
                    <div>
                      <span className="font-semibold text-foreground block mb-1">Answer Given:</span>
                      <p className="bg-background/80 p-2.5 rounded-lg border border-border/40 italic">
                        "{event.data.answer}"
                      </p>
                    </div>
                  )}
                  {/* Fallback for other data keys */}
                  {!event.data.question && !event.data.answer && (
                    <pre className="bg-background/85 p-3 rounded-lg overflow-x-auto text-xs font-mono border border-border/40">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
