import { auth } from "@/auth";
import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { analyzeResumeAgainstJob, extractKeywords } from "@/services/ats";
import { extractTextFromPdf } from "@/services/pdf";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    rateLimit(`ats:${session.user.id}`, 20);

    const formData = await request.formData();
    const file = formData.get("resume") as File | null;
    const jobDescription = String(formData.get("jobDescription") ?? "");
    const resumeId = String(formData.get("resumeId") ?? "") || undefined;
    const jobTitle = String(formData.get("jobTitle") ?? "Uploaded job description");
    const company = String(formData.get("company") ?? "") || undefined;

    if (!file) throw new ApiError(400, "A PDF resume file is required.", "MISSING_FILE");
    if (jobDescription.length < 80) throw new ApiError(422, "Job description must be at least 80 characters.", "JOB_DESCRIPTION_TOO_SHORT");

    const resumeText = await extractTextFromPdf(file);
    const analysis = analyzeResumeAgainstJob(resumeText, jobDescription);

    const savedJob = await prisma.jobDescription.create({
      data: {
        userId: session.user.id,
        title: jobTitle,
        company,
        content: jobDescription,
        keywords: extractKeywords(jobDescription)
      }
    });

    const atsScore = await prisma.atsScore.create({
      data: {
        userId: session.user.id,
        resumeId,
        jobDescriptionId: savedJob.id,
        resumeText,
        ...analysis
      }
    });

    return ok({ ...atsScore, jobDescription: savedJob });
  } catch (error) {
    return handleApiError(error);
  }
}
