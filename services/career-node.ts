import { CareerNodeType, Prisma, SectionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const nodeToSectionType: Record<CareerNodeType, SectionType> = {
  SUMMARY: SectionType.SUMMARY,
  EXPERIENCE: SectionType.EXPERIENCE,
  EDUCATION: SectionType.EDUCATION,
  SKILL: SectionType.SKILLS,
  PROJECT: SectionType.PROJECTS,
  CERTIFICATION: SectionType.CERTIFICATIONS,
  AWARD: SectionType.AWARDS,
  PUBLICATION: SectionType.CUSTOM,
  VOLUNTEERING: SectionType.CUSTOM,
  CUSTOM: SectionType.CUSTOM
};

export type CareerNodeInput = {
  type: CareerNodeType;
  title: string;
  organization?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
  summary?: string | null;
  content: Record<string, unknown>;
  tags: string[];
  skills: string[];
  keywords: string[];
  impactScore: number;
  evidenceLevel: number;
  visibility: boolean;
};

export function normalizeNodeInput(input: CareerNodeInput): Omit<Prisma.CareerNodeUncheckedCreateInput, "userId"> {
  return {
    ...input,
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
    content: input.content as Prisma.InputJsonObject
  };
}

export async function createCareerNode(userId: string, input: CareerNodeInput) {
  return prisma.careerNode.create({
    data: {
      ...normalizeNodeInput(input),
      userId
    }
  });
}

export async function composeResumeFromNodes(userId: string, title: string, nodeIds: string[], targetRole?: string) {
  const nodes = await prisma.careerNode.findMany({
    where: {
      id: { in: nodeIds },
      userId,
      visibility: true
    },
    orderBy: [{ type: "asc" }, { startDate: "desc" }, { updatedAt: "desc" }]
  });

  if (nodes.length !== nodeIds.length) {
    throw new Error("Some selected nodes were not found.");
  }

  const slug = `${slugify(title)}-${Date.now().toString(36)}`;
  return prisma.resume.create({
    data: {
      userId,
      title,
      slug,
      settings: {
        targetRole: targetRole ?? "",
        source: "career-node-composition"
      },
      sections: {
        create: nodes.map((node, position) => ({
          sourceNodeId: node.id,
          type: nodeToSectionType[node.type],
          title: node.title,
          content: {
            nodeType: node.type,
            organization: node.organization,
            location: node.location,
            startDate: node.startDate?.toISOString(),
            endDate: node.endDate?.toISOString(),
            isCurrent: node.isCurrent,
            summary: node.summary,
            content: node.content,
            skills: node.skills,
            keywords: node.keywords
          },
          position,
          visible: true
        }))
      }
    },
    include: { sections: { orderBy: { position: "asc" } } }
  });
}
