"use client";

import { useEffect, useState } from "react";
import { Upload, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserStore } from "@/app/store/useUserStore";
import { currentUser } from "@/lib/mock-data";

export function DashboardResumeCard() {
  const { user: storeUser, updateUser } = useUserStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const resumeName = isMounted ? storeUser.resumeName : currentUser.resumeName;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateUser({ resumeName: file.name });
    }
  };

  return (
    <Card className="border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="h-4 w-4 text-primary" />
          Resume
        </CardTitle>

        <CardDescription>
          Used to tailor your questions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {resumeName}
            </p>

            <p className="text-xs text-muted-foreground">
              Uploaded · 248 KB
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center transition-colors hover:bg-muted/40">
          <Upload className="h-5 w-5 text-muted-foreground" />

          <span className="mt-2 text-sm font-medium">
            Replace resume
          </span>

          <span className="text-xs text-muted-foreground">
            PDF, DOCX up to 5MB
          </span>

          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />
        </label>
      </CardContent>
    </Card>
  );
}
