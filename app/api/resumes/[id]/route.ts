import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/require-user";
import { resumeSchema } from "@/lib/validations";
import { assertResumeOwner } from "@/services/resume";
import { deleteResume, updateUserResume } from "@/repositories/resume-repository";
import { Prisma } from "@prisma/client";

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
    const data: Prisma.ResumeUpdateInput = {
      ...(body.title ? { title: body.title } : {}),
      ...(body.contact ? { contact: body.contact as Prisma.InputJsonObject } : {}),
      ...(body.settings ? { settings: body.settings as Prisma.InputJsonObject } : {}),
      ...(body.templateId ? { template: { connect: { id: body.templateId } } } : {})
    };

    const resume = await updateUserResume(id, data);

    return ok(resume);
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
