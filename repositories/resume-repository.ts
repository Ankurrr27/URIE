import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function createResumeRecord(args: { data: Prisma.ResumeCreateInput | Prisma.ResumeUncheckedCreateInput }) {
  return prisma.resume.create({
    data: args.data,
    include: { sections: { orderBy: { position: "asc" } }, template: true }
  });
}

export function findTemplateBySlug(slug: string) {
  return prisma.template.findUnique({ where: { slug } });
}

export function findResumeForUser(userId: string, resumeId: string) {
  return prisma.resume.findFirstOrThrow({
    where: { id: resumeId, userId },
    include: { sections: { orderBy: { position: "asc" } }, template: true }
  });
}

export async function listUserResumes(input: { userId: string; page: number; pageSize: number; q?: string }) {
  const where = {
    userId: input.userId,
    ...(input.q ? { title: { contains: input.q, mode: "insensitive" as const } } : {})
  };

  const [items, total] = await Promise.all([
    prisma.resume.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      include: { template: true, _count: { select: { sections: true, atsScores: true } } }
    }),
    prisma.resume.count({ where })
  ]);

  return { items, total };
}

export function listAllUserResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { template: true, _count: { select: { sections: true, atsScores: true } } }
  });
}

export function updateUserResume(resumeId: string, data: Prisma.ResumeUpdateInput) {
  return prisma.resume.update({
    where: { id: resumeId },
    data,
    include: { sections: { orderBy: { position: "asc" } }, template: true }
  });
}

export function deleteResume(resumeId: string) {
  return prisma.resume.delete({ where: { id: resumeId } });
}

export function createResumeSection(data: Prisma.ResumeSectionUncheckedCreateInput) {
  return prisma.resumeSection.create({ data });
}

export function reorderResumeSections(resumeId: string, sectionIds: string[]) {
  return prisma.$transaction(
    sectionIds.map((sectionId, position) =>
      prisma.resumeSection.update({
        where: { id: sectionId, resumeId },
        data: { position }
      })
    )
  );
}
