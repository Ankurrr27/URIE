import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/require-user";
import { rateLimit } from "@/lib/rate-limit";
import { resumeSchema } from "@/lib/validations";
import { createResume } from "@/services/resume";
import { listUserResumes } from "@/repositories/resume-repository";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    rateLimit(`resumes:list:${user.id}`);

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 12)));
    const q = url.searchParams.get("q") ?? undefined;

    const { items, total } = await listUserResumes({ userId: user.id, page, pageSize, q });

    return ok({ items, page, pageSize, total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    rateLimit(`resumes:create:${user.id}`, 20);

    const body = resumeSchema.parse(await request.json());
    const resume = await createResume(user.id, {
      ...body,
      contact: body.contact as Prisma.InputJsonObject,
      settings: body.settings as Prisma.InputJsonObject
    });
    return ok(resume, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
