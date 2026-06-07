import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/require-user";
import { rateLimit } from "@/lib/rate-limit";
import { latexCompileSchema } from "@/lib/validations";
import { compileLatex } from "@/services/latex";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    rateLimit(`latex:${user.id}`, 8);
    const body = latexCompileSchema.parse(await request.json());
    return ok(await compileLatex(body.source, body.engine));
  } catch (error) {
    return handleApiError(error);
  }
}
