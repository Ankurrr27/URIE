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

export async function createResumeFromTheme(userId: string, themeSlug: string) {
  const isSde = themeSlug === "sde-one-page";
  const themeName = isSde ? "SDE One Page Resume" : themeSlug === "professional-corporate" ? "Professional Corporate Resume" : "Modern Minimal Resume";
  const slug = `${slugify(themeName)}-${Date.now().toString(36)}`;

  const template = await prisma.template.findUnique({ where: { slug: themeSlug } });
  const settings: Prisma.InputJsonObject = {
    theme: themeSlug === "professional-corporate" ? "corporate" : "modern",
    themeSlug,
    onePage: true,
    textSize: isSde ? "compact" : "comfortable",
    underlineSections: true,
    underlineLinks: true,
    accentColor: themeSlug === "professional-corporate" ? "#1f4f8f" : "#0f8fa3"
  };

  const sections = isSde
    ? [
        { type: SectionType.EDUCATION, title: "Education", content: { text: "" }, position: 0 },
        { type: SectionType.SKILLS, title: "Skills", content: { text: "" }, position: 1 },
        { type: SectionType.PROJECTS, title: "Projects", content: { text: "" }, position: 2 },
        { type: SectionType.CUSTOM, title: "Relevant Coursework", content: { text: "" }, position: 3 },
        { type: SectionType.AWARDS, title: "Achievements", content: { text: "" }, position: 4 },
        { type: SectionType.CUSTOM, title: "Positions of Responsibility", content: { text: "" }, position: 5 },
        { type: SectionType.CERTIFICATIONS, title: "Certificates", content: { text: "" }, position: 6 }
      ]
    : [
        { type: SectionType.SUMMARY, title: "Professional Summary", content: { text: "" }, position: 0 },
        { type: SectionType.EXPERIENCE, title: "Experience", content: { text: "" }, position: 1 },
        { type: SectionType.SKILLS, title: "Skills", content: { text: "" }, position: 2 },
        { type: SectionType.PROJECTS, title: "Projects", content: { text: "" }, position: 3 },
        { type: SectionType.EDUCATION, title: "Education", content: { text: "" }, position: 4 }
      ];

  return prisma.resume.create({
    data: {
      userId,
      title: themeName,
      slug,
      templateId: template?.id,
      contact: {
        name: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        links: ""
      },
      settings,
      sections: { create: sections }
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
