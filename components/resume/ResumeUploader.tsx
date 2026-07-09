"use client";

import React, { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface ResumeUploaderProps {
  onUploaded: () => void;
}

export default function ResumeUploader({ onUploaded }: ResumeUploaderProps) {
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

      toast.success("Resume uploaded successfully.");
      onUploaded();
    } catch {
      toast.error("Something went wrong during upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Card className="border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">Upload Resume</CardTitle>
        <CardDescription>
          Upload your PDF resume to customize and tailor your AI interview questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center transition-colors hover:bg-muted/40">
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}

          <span className="mt-3 text-sm font-medium">
            {uploading ? "Uploading your resume..." : "Select or drag PDF here"}
          </span>

          <span className="text-xs text-muted-foreground mt-1">PDF up to 5MB</span>

          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </CardContent>
    </Card>
  );
}
