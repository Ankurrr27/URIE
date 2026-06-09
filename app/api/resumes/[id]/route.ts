import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/require-user";
import { resumeSchema } from "@/lib/validations";
import { assertResumeOwner } from "@/services/resume";
import { deleteResume, updateUserResume } from "@/repositories/resume-repository";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return ok(await assertResumeOwner(user.id, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await assertResumeOwner(user.id, id);
    const body = resumeSchema.partial().parse(await request.json());
    
    // 1. Update resume metadata
    const data: Prisma.ResumeUpdateInput = {
      ...(body.title ? { title: body.title } : {}),
      ...(body.contact ? { contact: body.contact as Prisma.InputJsonObject } : {}),
      ...(body.settings ? { settings: body.settings as Prisma.InputJsonObject } : {}),
      ...(body.templateId ? { template: { connect: { id: body.templateId } } } : {})
    };
    await updateUserResume(id, data);

    // 2. Synchronize sections if provided
    if (body.sections) {
      const bodySectionIds = body.sections.map((s) => s.id);
      
      // Delete missing sections
      await prisma.resumeSection.deleteMany({
        where: {
          resumeId: id,
          id: { notIn: bodySectionIds }
        }
      });

      // Upsert current sections
      for (const sec of body.sections) {
        await prisma.resumeSection.upsert({
          where: { id: sec.id },
          create: {
            id: sec.id,
            resumeId: id,
            type: sec.type,
            title: sec.title,
            content: sec.content as Prisma.InputJsonObject,
            position: sec.position,
            visible: sec.visible
          },
          update: {
            title: sec.title,
            content: sec.content as Prisma.InputJsonObject,
            position: sec.position,
            visible: sec.visible
          }
        });
      }
    }

    // Return the updated resume with sorted sections
    const updated = await assertResumeOwner(user.id, id);
    return ok(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await assertResumeOwner(user.id, id);
    await deleteResume(id);
    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
