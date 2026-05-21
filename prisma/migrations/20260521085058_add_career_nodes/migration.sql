-- CreateEnum
CREATE TYPE "CareerNodeType" AS ENUM ('SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILL', 'PROJECT', 'CERTIFICATION', 'AWARD', 'PUBLICATION', 'VOLUNTEERING', 'CUSTOM');

-- AlterTable
ALTER TABLE "resume_sections" ADD COLUMN     "sourceNodeId" TEXT;

-- CreateTable
CREATE TABLE "career_nodes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CareerNodeType" NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT,
    "location" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "content" JSONB NOT NULL DEFAULT '{}',
    "tags" TEXT[],
    "skills" TEXT[],
    "keywords" TEXT[],
    "impactScore" INTEGER NOT NULL DEFAULT 0,
    "evidenceLevel" INTEGER NOT NULL DEFAULT 1,
    "visibility" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "career_nodes_userId_type_idx" ON "career_nodes"("userId", "type");

-- CreateIndex
CREATE INDEX "career_nodes_userId_updatedAt_idx" ON "career_nodes"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "resume_sections_sourceNodeId_idx" ON "resume_sections"("sourceNodeId");

-- AddForeignKey
ALTER TABLE "resume_sections" ADD CONSTRAINT "resume_sections_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "career_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_nodes" ADD CONSTRAINT "career_nodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
