import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { careerNodeSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    const { id } = await params;
    const body = careerNodeSchema.partial().parse(await request.json());

    const existing = await prisma.careerNode.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) throw new ApiError(404, "Career node not found.", "NOT_FOUND");

    const node = await prisma.careerNode.update({
      where: { id },
      data: {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        content: body.content as Prisma.InputJsonObject | undefined
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
