import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long")
      .trim(),
    email: z
      .string()
      .email("Please enter a valid email address")
      .max(254)
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must include uppercase, lowercase and a number"
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// ─── Resume ───────────────────────────────────────────────────────────────────

export const resumeCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).trim(),
  templateId: z.string().optional(),
  targetRole: z.string().max(200).trim().optional(),
});

export const resumeUpdateSchema = resumeCreateSchema.partial();

export type ResumeCreateInput = z.infer<typeof resumeCreateSchema>;
export type ResumeUpdateInput = z.infer<typeof resumeUpdateSchema>;

// ─── Profile ──────────────────────────────────────────────────────────────────

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim().optional(),
  headline: z.string().max(200).trim().nullable().optional(),
  location: z.string().max(200).trim().nullable().optional(),
  website: z.string().trim().url("Please enter a valid website URL").or(z.literal("")).nullable().optional(),
  themePreference: z.string().optional(),
  image: z.string().nullable().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ─── Extra Resume and Sections Schemas ────────────────────────────────────────

export const resumeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).trim(),
  templateId: z.string().optional().nullable(),
  contact: z.record(z.any()).default({}),
  settings: z.record(z.any()).default({}),
  sections: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["SUMMARY", "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS", "AWARDS", "CUSTOM"]),
      title: z.string().min(1).max(100),
      content: z.record(z.any()),
      position: z.number().int().nonnegative(),
      visible: z.boolean()
    })
  ).optional()
});

export const sectionSchema = z.object({
  type: z.enum(["SUMMARY", "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS", "AWARDS", "CUSTOM"]),
  title: z.string().min(1).max(100),
  content: z.record(z.any()).default({}),
  position: z.number().int().nonnegative().default(0),
  visible: z.boolean().default(true),
});

export const reorderSectionsSchema = z.object({
  sectionIds: z.array(z.string()),
});

// ─── Career Node Schemas ──────────────────────────────────────────────────────

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
    "CUSTOM",
  ]),
  title: z.string().min(1, "Title is required").max(200).trim(),
  organization: z.string().max(200).trim().nullable().optional(),
  location: z.string().max(200).trim().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean().default(false),
  summary: z.string().nullable().optional(),
  content: z.record(z.any()).default({}),
  tags: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  impactScore: z.number().int().min(0).max(100).default(0),
  evidenceLevel: z.number().int().min(1).max(5).default(1),
  visibility: z.boolean().default(true),
});

export const composeResumeSchema = z.object({
  title: z.string().min(1, "Resume title is required").max(200).trim(),
  targetRole: z.string().max(200).trim().optional(),
  nodeIds: z.array(z.string()).min(1, "At least one node must be selected"),
});

// ─── AI Prompts ───────────────────────────────────────────────────────────────

export const aiPromptSchema = z.object({
  content: z.string().min(1, "Content is required"),
  jobDescription: z.string().optional().nullable(),
});

// ─── LaTeX Compilation ────────────────────────────────────────────────────────

export const latexCompileSchema = z.object({
  source: z.string().min(1, "LaTeX source is required"),
  engine: z.enum(["pdflatex", "xelatex"]).default("pdflatex"),
});
