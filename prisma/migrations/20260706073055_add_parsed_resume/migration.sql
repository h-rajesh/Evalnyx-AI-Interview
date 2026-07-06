-- CreateTable
CREATE TABLE "ParsedResume" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "fullName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "summary" TEXT,
    "skills" JSONB,
    "education" JSONB,
    "experience" JSONB,
    "projects" JSONB,
    "certifications" JSONB,
    "rawText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParsedResume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParsedResume_resumeId_key" ON "ParsedResume"("resumeId");

-- AddForeignKey
ALTER TABLE "ParsedResume" ADD CONSTRAINT "ParsedResume_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
