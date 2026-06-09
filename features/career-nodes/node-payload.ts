import type { CareerNodeType } from "@/types/career-node";

export type CareerNodePayloadDraft = {
  title: string;
  organization: string | null;
  summary: string;
  content: Record<string, string | string[]>;
  tags: string[];
  skills: string[];
  keywords: string[];
};

export function parseBullets(text: string): string[] {
  if (!text) return [];
  
  const cleanText = text.replace(/\r/g, "");
  const rawLines = cleanText.split("\n").map(line => line.trim()).filter(Boolean);
  if (rawLines.length === 0) return [];

  const bulletRegex = /^[•*\-\u2022\u25E6\u25AA\u25AB]\s*/;

  // Each non-empty line is its own bullet point.
  // Strip leading bullet markers if present.
  return rawLines.map(line => line.replace(bulletRegex, ""));
}

export function buildNodePayload(type: CareerNodeType, formData: FormData): CareerNodePayloadDraft {
  const get = (name: string) => String(formData.get(name) ?? "").trim();
  const bullets = parseBullets(get("bullets"));
  const content = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, String(value).trim()]));

  switch (type) {
    case "SKILL": {
      const domain = get("domain");
      const skillName = get("skillName");
      return { title: skillName, organization: domain || null, summary: `${skillName}${domain ? ` in ${domain}` : ""}`, content, skills: [skillName].filter(Boolean), keywords: [skillName, domain].filter(Boolean), tags: [domain].filter(Boolean) };
    }
    case "PROJECT":
      return { title: get("projectName"), organization: get("timeline") || null, summary: bullets.join("\n"), content: { ...content, bullets }, skills: [], keywords: splitList(get("projectName")), tags: splitList(get("timeline")) };
    case "EDUCATION":
      return { title: get("course"), organization: get("college") || null, summary: [get("college"), get("course"), get("cgpa"), get("graduationDate")].filter(Boolean).join(" | "), content, skills: [], keywords: splitList(`${get("course")}, ${get("college")}`), tags: ["education"] };
    case "CONTACT_INFO":
      return { title: get("email") || "Contact info", organization: get("location") || null, summary: [get("email"), get("phone"), get("location"), get("portfolio")].filter(Boolean).join(" | "), content, skills: [], keywords: [], tags: ["contact"] };
    case "SOCIAL_HANDLE":
    case "CODING_PROFILE":
      return { title: get("platform"), organization: get("url") || null, summary: [get("platform"), get("url"), get("stats")].filter(Boolean).join(" | "), content, skills: [], keywords: [get("platform")].filter(Boolean), tags: [type === "CODING_PROFILE" ? "coding" : "social"] };
    case "RELEVANT_COURSEWORK":
      return { title: "Relevant Coursework", organization: null, summary: get("courses"), content: { ...content, courses: splitList(get("courses")) }, skills: splitList(get("courses")), keywords: splitList(get("courses")), tags: ["coursework"] };
    case "ACHIEVEMENT":
      return { title: get("achievement"), organization: get("metric") || null, summary: [get("achievement"), get("metric"), get("context")].filter(Boolean).join(" - "), content, skills: [], keywords: splitList(`${get("achievement")}, ${get("metric")}`), tags: ["achievement"] };
    case "POSITION_OF_RESPONSIBILITY":
    case "EXPERIENCE":
      return { title: get("role"), organization: get("organization") || get("company") || null, summary: bullets.join("\n"), content: { ...content, bullets }, skills: [], keywords: splitList(`${get("role")}, ${get("organization")}, ${get("company")}`), tags: [type === "EXPERIENCE" ? "experience" : "responsibility"] };
    case "CERTIFICATION":
      return { title: get("certificateName"), organization: get("issuer") || null, summary: [get("certificateName"), get("issuer"), get("credentialLink")].filter(Boolean).join(" | "), content, skills: [], keywords: splitList(`${get("certificateName")}, ${get("issuer")}`), tags: ["certificate"] };
    default:
      return { title: get("title"), organization: null, summary: get("details"), content, skills: [], keywords: [], tags: ["custom"] };
  }
}

export function estimateImpact(value: string) {
  let score = 35;
  if (/\d+%|\$\d+|\d+x/i.test(value)) score += 35;
  if (/led|owned|built|launched|improved|reduced|increased|automated/i.test(value)) score += 20;
  return Math.min(100, score);
}

export function estimateEvidenceLevel(value: string) {
  return /\d+%|\$\d+|\d+x|\d+\s+(users|customers|requests)/i.test(value) ? 4 : 2;
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

