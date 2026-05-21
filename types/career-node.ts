export type CareerNodeType =
  | "SUMMARY"
  | "EXPERIENCE"
  | "EDUCATION"
  | "SKILL"
  | "PROJECT"
  | "CERTIFICATION"
  | "AWARD"
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
  content: Record<string, unknown>;
  tags: string[];
  skills: string[];
  keywords: string[];
  impactScore: number;
  evidenceLevel: number;
  visibility: boolean;
  updatedAt: string;
};
