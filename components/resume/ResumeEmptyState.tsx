export default function ResumeEmptyState() {
  return (
    <div className="rounded-xl border p-8 text-center">
      <h2 className="text-lg font-semibold">
        No Resume Uploaded
      </h2>

      <p className="text-muted-foreground mt-2">
        Upload a PDF resume to start AI interviews.
      </p>
    </div>
  );
}