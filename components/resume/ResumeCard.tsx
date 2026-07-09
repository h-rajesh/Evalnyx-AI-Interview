"use client";

import React, { useState } from "react";
import { FileText, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { Resume } from "@/hooks/useResume";

interface ResumeCardProps {
  resume: Resume;
  onRefresh: () => void;
}

export default function ResumeCard({ resume, onRefresh }: ResumeCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your resume?")) return;

    try {
      setDeleting(true);
      const res = await fetch("/api/resume", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete resume.");
        return;
      }

      toast.success("Resume deleted successfully.");
      onRefresh();
    } catch {
      toast.error("Something went wrong while deleting.");
    } finally {
      setDeleting(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const uploadDate = new Date(resume.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Active Resume
        </CardTitle>
        <CardDescription>
          This resume is currently active and used to tailor your interviews.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/40 p-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{resume.fileName}</p>
              <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 text-xs text-muted-foreground">
                <span>{formatBytes(resume.fileSize)}</span>
                <span>•</span>
                <span>Uploaded on {uploadDate}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild>
              <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                View
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1.5"
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
