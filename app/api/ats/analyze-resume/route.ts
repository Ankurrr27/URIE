import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/require-user";
import { rateLimit } from "@/lib/rate-limit";
import { analyzeResumeAgainstJob, extractKeywords } from "@/services/ats";
import { assertResumeOwner } from "@/services/resume";
import { saveAtsAnalysis } from "@/repositories/ats-repository";
import type { Resume } from "@/types/resume";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    rateLimit(`ats:json:${user.id}`, 20);

    const body = await request.json();
    const { resumeId, jobDescription, jobTitle = "Target Role", company } = body;

    if (!resumeId) throw new ApiError(400, "resumeId is required.", "MISSING_RESUME_ID");
    if (!jobDescription || jobDescription.length < 80) {
      throw new ApiError(422, "Job description must be at least 80 characters.", "JOB_DESCRIPTION_TOO_SHORT");
    }

    const resume = await assertResumeOwner(user.id, resumeId);
    if (!resume) throw new ApiError(404, "Resume not found.", "NOT_FOUND");

    // Serialize resume content to text
    const resumeText = serializeResumeToText(resume as any);

    const analysis = analyzeResumeAgainstJob(resumeText, jobDescription);

    const { atsScore, jobDescription: savedJob } = await saveAtsAnalysis({
      userId: user.id,
      resumeId,
      job: {
        userId: user.id,
        title: jobTitle,
        company: company || undefined,
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

function serializeResumeToText(resume: Resume): string {
  const parts = [];
  parts.push(resume.contact.name ?? "");
  parts.push(
    [resume.contact.email, resume.contact.phone, resume.contact.location]
      .filter(Boolean)
      .join(" | ")
  );
  if (resume.contact.website) parts.push(resume.contact.website);
  if (resume.contact.links) parts.push(resume.contact.links);

  for (const section of resume.sections) {
    if (!section.visible) continue;
    parts.push(section.title);
    if (typeof section.content.text === "string") {
      parts.push(section.content.text);
    } else if (typeof section.content.summary === "string") {
      parts.push(section.content.summary);
      if (Array.isArray(section.content.skills)) {
        parts.push(section.content.skills.join(", "));
      }
    } else if (Array.isArray(section.content.items)) {
      parts.push(
        section.content.items
          .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
          .join("\n")
      );
    }
  }
  return parts.join("\n\n");
}
