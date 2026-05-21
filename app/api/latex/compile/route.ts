import { auth } from "@/auth";
import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { latexCompileSchema } from "@/lib/validations";
import { compileLatex } from "@/services/latex";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    rateLimit(`latex:${session.user.id}`, 8);
    const body = latexCompileSchema.parse(await request.json());
    return ok(await compileLatex(body.source, body.engine));
  } catch (error) {
    return handleApiError(error);
  }
}
