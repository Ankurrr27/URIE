import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/require-user";
import { reorderSectionsSchema, sectionSchema } from "@/lib/validations";
import { assertResumeOwner } from "@/services/resume";
import { createResumeSection, reorderResumeSections } from "@/repositories/resume-repository";
import { Prisma } from "@prisma/client";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await assertResumeOwner(user.id, id);
    const body = sectionSchema.parse(await request.json());

    const section = await createResumeSection({
      resumeId: id,
      type: body.type,
      title: body.title,
      content: body.content as Prisma.InputJsonValue,
      position: body.position,
      visible: body.visible
    });

    return ok(section, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await assertResumeOwner(user.id, id);
    const body = reorderSectionsSchema.parse(await request.json());

    await reorderResumeSections(id, body.sectionIds);

    return ok({ reordered: true });
  } catch (error) {
    return handleApiError(error);
  }
}
