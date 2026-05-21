import { Prisma, SectionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function createResume(userId: string, data: { title: string; templateId?: string; contact?: Prisma.InputJsonObject; settings?: Prisma.InputJsonObject }) {
  const slug = `${slugify(data.title)}-${Date.now().toString(36)}`;

  return prisma.resume.create({
    data: {
      userId,
      title: data.title,
      slug,
      templateId: data.templateId,
      contact: data.contact ?? {},
      settings: data.settings ?? {},
      sections: {
        create: [
          { type: SectionType.SUMMARY, title: "Professional Summary", content: { text: "" }, position: 0 },
          { type: SectionType.EXPERIENCE, title: "Experience", content: { items: [] }, position: 1 },
          { type: SectionType.SKILLS, title: "Skills", content: { groups: [] }, position: 2 }
        ]
      }
    },
    include: { sections: { orderBy: { position: "asc" } }, template: true }
  });
}

export async function assertResumeOwner(userId: string, resumeId: string) {
  return prisma.resume.findFirstOrThrow({
    where: { id: resumeId, userId },
    include: { sections: { orderBy: { position: "asc" } }, template: true }
  });
}
