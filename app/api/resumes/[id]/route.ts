import { auth } from "@/auth";
import { ApiError, handleApiError, ok } from "@/lib/api-response";
import { resumeSchema } from "@/lib/validations";
import { assertResumeOwner } from "@/services/resume";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    const { id } = await params;
    return ok(await assertResumeOwner(session.user.id, id));
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
    const body = resumeSchema.partial().parse(await request.json());
    const data: Prisma.ResumeUpdateInput = {
      ...(body.title ? { title: body.title } : {}),
      ...(body.contact ? { contact: body.contact as Prisma.InputJsonObject } : {}),
      ...(body.settings ? { settings: body.settings as Prisma.InputJsonObject } : {}),
      ...(body.templateId ? { template: { connect: { id: body.templateId } } } : {})
    };

    const resume = await prisma.resume.update({
      where: { id },
      data,
      include: { sections: { orderBy: { position: "asc" } }, template: true }
    });

    return ok(resume);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    const { id } = await params;
    await assertResumeOwner(session.user.id, id);
    await prisma.resume.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
