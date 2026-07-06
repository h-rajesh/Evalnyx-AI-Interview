"use client";

import { useEffect, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export function DashboardResumeCard() {
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be smaller than 5MB.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      setUploading(true);

      const res = await fetch("/api/resume", {
        method: "POST",
        credentials: "include",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Upload failed.");
        return;
      }

      setResumeName(file.name);
      toast.success("Resume uploaded successfully.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setUploading(false);
      // reset input so same file can be re-selected
      e.target.value = "";
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
        {resumeName && (
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <FileText className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{resumeName}</p>
              <p className="text-xs text-muted-foreground">Uploaded</p>
            </div>
          </div>
        )}

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center transition-colors hover:bg-muted/40">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" />
          )}

          <span className="mt-2 text-sm font-medium">
            {uploading ? "Uploading..." : resumeName ? "Replace resume" : "Upload resume"}
          </span>

          <span className="text-xs text-muted-foreground">PDF up to 5MB</span>

          <input
            type="file"
            className="hidden"
            accept=".pdf"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>
      </CardContent>
    </Card>
  );
}
