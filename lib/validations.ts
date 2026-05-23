import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }, z.string().max(max).nullable().optional());

const stringList = (maxItems: number, maxLength: number) =>
  z.preprocess((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }, z.array(z.string().trim().min(1).max(maxLength)).max(maxItems).default([]));

const imageUrl = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}, z.union([z.string().url(), z.string().regex(/^\/uploads\/.+/, "Must be an uploaded image path.")]).nullable().optional());

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const resumeSchema = z.object({
  title: z.string().min(2).max(120),
  templateId: z.string().optional(),
  contact: z.record(z.unknown()).default({}),
  settings: z.record(z.unknown()).default({})
});

export const sectionSchema = z.object({
  type: z.enum(["SUMMARY", "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS", "AWARDS", "CUSTOM"]),
  title: z.string().min(2).max(100),
  content: z.record(z.unknown()).or(z.array(z.unknown())),
  position: z.number().int().min(0),
  visible: z.boolean().default(true)
});

export const reorderSectionsSchema = z.object({
  sectionIds: z.array(z.string()).min(1)
});

export const aiPromptSchema = z.object({
  resumeId: z.string().optional(),
  content: z.string().min(20).max(8000),
  jobDescription: z.string().max(12000).optional()
});

export const latexCompileSchema = z.object({
  source: z.string().min(20).max(100000),
  engine: z.enum(["pdflatex", "xelatex"]).default("pdflatex")
});

export const careerNodeSchema = z.object({
  type: z.enum([
    "CONTACT_INFO",
    "SOCIAL_HANDLE",
    "SUMMARY",
    "EXPERIENCE",
    "EDUCATION",
    "SKILL",
    "PROJECT",
    "CERTIFICATION",
    "AWARD",
    "ACHIEVEMENT",
    "RELEVANT_COURSEWORK",
    "POSITION_OF_RESPONSIBILITY",
    "CODING_PROFILE",
    "PUBLICATION",
    "VOLUNTEERING",
    "CUSTOM"
  ]),
  title: z.string().trim().min(2).max(140),
  organization: optionalText(140),
  location: optionalText(120),
  startDate: optionalText(40),
  endDate: optionalText(40),
  isCurrent: z.boolean().default(false),
  summary: optionalText(2000),
  content: z.record(z.unknown()).default({}),
  tags: stringList(30, 48),
  skills: stringList(40, 64),
  keywords: stringList(60, 64),
  impactScore: z.coerce.number().int().min(0).max(100).default(0),
  evidenceLevel: z.coerce.number().int().min(1).max(5).default(1),
  visibility: z.boolean().default(true)
});

export const composeResumeSchema = z.object({
  title: z.string().trim().min(2).max(120),
  targetRole: optionalText(140),
  nodeIds: z.array(z.string()).min(1).max(40)
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  headline: optionalText(140),
  location: optionalText(120),
  website: optionalText(180),
  image: imageUrl,
  themePreference: z.enum(["light", "dark", "system"]).default("system")
});
