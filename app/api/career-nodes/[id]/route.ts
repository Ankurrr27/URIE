import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { careerNodeSchema } from "@/lib/validations";

const metadataPatchSchema = careerNodeSchema.partial().extend({
  color: careerNodeSchema.shape.title.optional(),
  starred: careerNodeSchema.shape.visibility.optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    const { id } = await params;
    const raw = await request.json();
    const body = metadataPatchSchema.parse(raw);

    const existing = await prisma.careerNode.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) throw new ApiError(404, "Career node not found.", "NOT_FOUND");

    const node = await prisma.careerNode.update({
      where: { id },
      data: {
        ...(body.type ? { type: body.type } : {}),
        ...(body.title ? { title: body.title } : {}),
        ...(body.organization !== undefined ? { organization: body.organization } : {}),
        ...(body.location !== undefined ? { location: body.location } : {}),
        ...(body.isCurrent !== undefined ? { isCurrent: body.isCurrent } : {}),
        ...(body.summary !== undefined ? { summary: body.summary } : {}),
        ...(body.tags ? { tags: body.tags } : {}),
        ...(body.skills ? { skills: body.skills } : {}),
        ...(body.keywords ? { keywords: body.keywords } : {}),
        ...(body.impactScore !== undefined ? { impactScore: body.impactScore } : {}),
        ...(body.evidenceLevel !== undefined ? { evidenceLevel: body.evidenceLevel } : {}),
        ...(body.visibility !== undefined ? { visibility: body.visibility } : {}),
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        content:
          body.color !== undefined || body.starred !== undefined
            ? ({ ...(existing.content as Record<string, unknown>), color: body.color, starred: body.starred } as Prisma.InputJsonObject)
            : (body.content as Prisma.InputJsonObject | undefined)
      }
    });

    return ok(node);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    const { id } = await params;

    const existing = await prisma.careerNode.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) throw new ApiError(404, "Career node not found.", "NOT_FOUND");

    await prisma.careerNode.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
