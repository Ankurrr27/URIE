import { auth } from "@/auth";
import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { aiPromptSchema } from "@/lib/validations";
import { generateResumeAdvice } from "@/services/ai";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    rateLimit(`ai:bullets:${session.user.id}`, 20);
    const body = aiPromptSchema.parse(await request.json());
    return ok(await generateResumeAdvice(
      "You improve resume bullets using action verbs, measurable outcomes, and truthful framing. Preserve facts.",
      `Improve these resume bullets:\n${body.content}\n\nJob description:\n${body.jobDescription ?? ""}`
    ));
  } catch (error) {
    return handleApiError(error);
  }
}
