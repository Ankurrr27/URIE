import { CareerNodeType, Prisma, SectionType } from "@prisma/client";
import { slugify } from "@/lib/utils";
import { createCareerNodeRecord, listVisibleCareerNodesByIds } from "@/repositories/career-node-repository";
import { createResumeRecord } from "@/repositories/resume-repository";

const nodeToSectionType: Record<CareerNodeType, SectionType> = {
  CONTACT_INFO: SectionType.CUSTOM,
  SOCIAL_HANDLE: SectionType.CUSTOM,
  SUMMARY: SectionType.SUMMARY,
  EXPERIENCE: SectionType.EXPERIENCE,
  EDUCATION: SectionType.EDUCATION,
  SKILL: SectionType.SKILLS,
  PROJECT: SectionType.PROJECTS,
  CERTIFICATION: SectionType.CERTIFICATIONS,
  AWARD: SectionType.AWARDS,
  ACHIEVEMENT: SectionType.AWARDS,
  RELEVANT_COURSEWORK: SectionType.CUSTOM,
  POSITION_OF_RESPONSIBILITY: SectionType.CUSTOM,
  CODING_PROFILE: SectionType.CUSTOM,
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
  return createCareerNodeRecord({
    ...normalizeNodeInput(input),
    userId
  });
}

export async function composeResumeFromNodes(userId: string, title: string, nodeIds: string[], targetRole?: string) {
  const nodes = await listVisibleCareerNodesByIds(userId, nodeIds);

  if (nodes.length !== nodeIds.length) {
    throw new Error("Some selected nodes were not found.");
  }

  const slug = `${slugify(title)}-${Date.now().toString(36)}`;
  return createResumeRecord({
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
    }
  });
}
