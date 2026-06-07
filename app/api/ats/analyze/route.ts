import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/require-user";
import { rateLimit } from "@/lib/rate-limit";
import { analyzeResumeAgainstJob, extractKeywords } from "@/services/ats";
import { extractTextFromPdf } from "@/services/pdf";
import { saveAtsAnalysis } from "@/repositories/ats-repository";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    rateLimit(`ats:${user.id}`, 20);

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

    const { atsScore, jobDescription: savedJob } = await saveAtsAnalysis({
      userId: user.id,
      resumeId,
      job: {
        userId: user.id,
        title: jobTitle,
        company,
        content: jobDescription,
        keywords: extractKeywords(jobDescription)
      },
      score: {
        resumeText,
        ...analysis
      }
    });

    return ok({ ...atsScore, jobDescription: savedJob });
  } catch (error) {
    return handleApiError(error);
  }
}
