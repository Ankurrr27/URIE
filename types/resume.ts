export type ResumeSectionType =
  | "SUMMARY"
  | "EXPERIENCE"
  | "EDUCATION"
  | "SKILLS"
  | "PROJECTS"
  | "CERTIFICATIONS"
  | "AWARDS"
  | "CUSTOM";

export type ResumeSection = {
  id: string;
  type: ResumeSectionType;
  title: string;
  content: Record<string, unknown>;
  position: number;
  visible: boolean;
};

export type Resume = {
  id: string;
  title: string;
  slug: string;
  contact: Record<string, unknown>;
  settings: Record<string, unknown>;
  sections: ResumeSection[];
};
