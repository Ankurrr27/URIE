import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function saveAtsAnalysis(input: {
  userId: string;
  resumeId?: string;
  job: Prisma.JobDescriptionUncheckedCreateInput;
  score: Omit<Prisma.AtsScoreUncheckedCreateInput, "userId" | "resumeId" | "jobDescriptionId">;
}) {
  const savedJob = await prisma.jobDescription.create({ data: input.job });
  const atsScore = await prisma.atsScore.create({
    data: {
      userId: input.userId,
      resumeId: input.resumeId,
      jobDescriptionId: savedJob.id,
      ...input.score
    }
  });

  return { atsScore, jobDescription: savedJob };
}
