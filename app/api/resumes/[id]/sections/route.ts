import { auth } from "@/auth";
import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { reorderSectionsSchema, sectionSchema } from "@/lib/validations";
import { assertResumeOwner } from "@/services/resume";
import { Prisma } from "@prisma/client";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    const { id } = await params;
    await assertResumeOwner(session.user.id, id);
    const body = sectionSchema.parse(await request.json());

    const section = await prisma.resumeSection.create({
      data: {
        resumeId: id,
        type: body.type,
        title: body.title,
        content: body.content as Prisma.InputJsonValue,
        position: body.position,
        visible: body.visible
      }
    });

    return ok(section, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    const { id } = await params;
    await assertResumeOwner(session.user.id, id);
    const body = reorderSectionsSchema.parse(await request.json());

    await prisma.$transaction(
      body.sectionIds.map((sectionId, position) =>
        prisma.resumeSection.update({
          where: { id: sectionId, resumeId: id },
          data: { position }
        })
      )
    );

    return ok({ reordered: true });
  } catch (error) {
    return handleApiError(error);
  }
}
