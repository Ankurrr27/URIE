import { auth } from "@/auth";
import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { resumeSchema } from "@/lib/validations";
import { createResume } from "@/services/resume";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    rateLimit(`resumes:list:${session.user.id}`);

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 12)));
    const q = url.searchParams.get("q") ?? undefined;

    const where = {
      userId: session.user.id,
      ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {})
    };

    const [items, total] = await Promise.all([
      prisma.resume.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { template: true, _count: { select: { sections: true, atsScores: true } } }
      }),
      prisma.resume.count({ where })
    ]);

    return ok({ items, page, pageSize, total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    rateLimit(`resumes:create:${session.user.id}`, 20);

    const body = resumeSchema.parse(await request.json());
    const resume = await createResume(session.user.id, {
      ...body,
      contact: body.contact as Prisma.InputJsonObject,
      settings: body.settings as Prisma.InputJsonObject
    });
    return ok(resume, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
