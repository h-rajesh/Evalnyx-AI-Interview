-- CreateTable
CREATE TABLE "InterviewTimelineEvent" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterviewTimelineEvent_interviewId_idx" ON "InterviewTimelineEvent"("interviewId");

-- AddForeignKey
ALTER TABLE "InterviewTimelineEvent" ADD CONSTRAINT "InterviewTimelineEvent_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
