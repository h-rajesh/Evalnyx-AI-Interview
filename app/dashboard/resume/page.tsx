"use client";

import { useResume } from "@/hooks/useResume";
import ResumeUploader from "@/components/resume/ResumeUploader";
import ResumeCard from "@/components/resume/ResumeCard";
import ResumeEmptyState from "@/components/resume/ResumeEmptyState";

export default function ResumePage() {
  const { resume, loading, refresh } = useResume();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Resume
        </h1>

        <p className="text-muted-foreground">
          Upload your latest resume.
        </p>
      </div>

      {resume ? (
        <ResumeCard
          resume={resume}
          onRefresh={refresh}
        />
      ) : (
        <ResumeEmptyState />
      )}

      <ResumeUploader onUploaded={refresh} />
    </div>
  );
}