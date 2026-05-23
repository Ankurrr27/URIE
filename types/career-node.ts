export type CareerNodeType =
  | "CONTACT_INFO"
  | "SOCIAL_HANDLE"
  | "SUMMARY"
  | "EXPERIENCE"
  | "EDUCATION"
  | "SKILL"
  | "PROJECT"
  | "CERTIFICATION"
  | "AWARD"
  | "ACHIEVEMENT"
  | "RELEVANT_COURSEWORK"
  | "POSITION_OF_RESPONSIBILITY"
  | "CODING_PROFILE"
  | "PUBLICATION"
  | "VOLUNTEERING"
  | "CUSTOM";

export type CareerNode = {
  id: string;
  type: CareerNodeType;
  title: string;
  organization: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  summary: string | null;
  content: Record<string, unknown> & {
    color?: string;
    starred?: boolean;
  };
  tags: string[];
  skills: string[];
  keywords: string[];
  impactScore: number;
  evidenceLevel: number;
  visibility: boolean;
  updatedAt: string;
};
