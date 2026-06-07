import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/require-user";
import { rateLimit } from "@/lib/rate-limit";
import { aiPromptSchema } from "@/lib/validations";
import { generateResumeAdvice } from "@/services/ai";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    rateLimit(`ai:skills:${user.id}`, 20);
    const body = aiPromptSchema.parse(await request.json());
    return ok(await generateResumeAdvice(
      "You suggest honest, job-relevant resume skills grouped by category. Do not invent experience.",
      `Candidate resume:\n${body.content}\n\nJob description:\n${body.jobDescription ?? ""}`
    ));
  } catch (error) {
    return handleApiError(error);
  }
}
