-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('HR', 'TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'MIXED');

-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('TEXT', 'VOICE', 'VIDEO');

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "completedTopics" JSONB,
ADD COLUMN     "currentQuestion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "feedback" JSONB,
ADD COLUMN     "interviewMode" "InterviewMode" NOT NULL DEFAULT 'VIDEO',
ADD COLUMN     "interviewType" "InterviewType" NOT NULL DEFAULT 'MIXED',
ADD COLUMN     "score" DOUBLE PRECISION,
ADD COLUMN     "techStack" JSONB,
ADD COLUMN     "totalQuestions" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "InterviewEvaluation" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "technicalScore" DOUBLE PRECISION NOT NULL,
    "communicationScore" DOUBLE PRECISION NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "correctnessScore" DOUBLE PRECISION NOT NULL,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "feedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterviewEvaluation_interviewId_idx" ON "InterviewEvaluation"("interviewId");

-- AddForeignKey
ALTER TABLE "InterviewEvaluation" ADD CONSTRAINT "InterviewEvaluation_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
