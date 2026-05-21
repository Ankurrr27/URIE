import { auth } from "@/auth";
import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { aiPromptSchema } from "@/lib/validations";
import { generateResumeAdvice } from "@/services/ai";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    rateLimit(`ai:summary:${session.user.id}`, 12);
    const body = aiPromptSchema.parse(await request.json());
    return ok(await generateResumeAdvice(
      "You write concise, ATS-friendly professional resume summaries. Return 3 strong options.",
      `Resume context:\n${body.content}\n\nTarget job:\n${body.jobDescription ?? "General professional role"}`
    ));
  } catch (error) {
    return handleApiError(error);
  }
}
