import type { CareerNodeType } from "@/types/career-node";

export type CareerNodeFieldConfig = {
  name: string;
  label: string;
  placeholder: string;
  kind?: "input" | "textarea";
  required?: boolean;
};

export type CareerNodeFormConfig = {
  type: CareerNodeType;
  label: string;
  helper: string;
  fields: CareerNodeFieldConfig[];
};

export const careerNodeFormConfigs: CareerNodeFormConfig[] = [
  { type: "SKILL", label: "Skill", helper: "Only domain and skill name are needed.", fields: [
    { name: "domain", label: "Skill domain", placeholder: "Full Stack / Backend / Tools", required: true },
    { name: "skillName", label: "Skill name", placeholder: "Next.js", required: true }
  ] },
  { type: "PROJECT", label: "Project", helper: "Project node captures links, heading, timeline, and bullets.", fields: [
    { name: "projectName", label: "Project heading", placeholder: "Vibe Code Editor", required: true },
    { name: "timeline", label: "Timeline", placeholder: "Jan 2026 - Mar 2026" },
    { name: "liveLink", label: "Working link", placeholder: "https://..." },
    { name: "repoLink", label: "Repo link", placeholder: "https://github.com/..." },
    { name: "designLink", label: "Design link", placeholder: "Figma / demo / case study link" },
    { name: "bullets", label: "Bullets", placeholder: "One bullet per line. Focus on impact and tech.", kind: "textarea", required: true }
  ] },
  { type: "EDUCATION", label: "Education", helper: "Education needs college, course, CGPA, and graduation date.", fields: [
    { name: "college", label: "College name", placeholder: "Indian Institute of Information Technology, Kota", required: true },
    { name: "course", label: "Course name", placeholder: "Bachelor of Computer Science", required: true },
    { name: "cgpa", label: "CGPA / grade", placeholder: "8.5 CGPA" },
    { name: "graduationDate", label: "Graduation date", placeholder: "May 2028" }
  ] },
  { type: "CONTACT_INFO", label: "Contact", helper: "Basic contact info for resume headers.", fields: [
    { name: "email", label: "Email", placeholder: "you@example.com", required: true },
    { name: "phone", label: "Phone", placeholder: "+91..." },
    { name: "location", label: "Location", placeholder: "City, Country" },
    { name: "portfolio", label: "Portfolio", placeholder: "https://..." }
  ] },
  { type: "SOCIAL_HANDLE", label: "Social", helper: "Add one social handle at a time.", fields: [
    { name: "platform", label: "Platform", placeholder: "LinkedIn / Twitter / Portfolio", required: true },
    { name: "url", label: "URL", placeholder: "https://...", required: true }
  ] },
  { type: "CODING_PROFILE", label: "Coding", helper: "Coding profile nodes are for GitHub, LeetCode, GFG, etc.", fields: [
    { name: "platform", label: "Platform", placeholder: "GitHub / LeetCode / GFG", required: true },
    { name: "url", label: "Profile URL", placeholder: "https://...", required: true },
    { name: "stats", label: "Stats", placeholder: "500+ problems solved / 1900 rating" }
  ] },
  { type: "RELEVANT_COURSEWORK", label: "Coursework", helper: "Keep coursework as a comma-separated course list.", fields: [
    { name: "courses", label: "Courses", placeholder: "DSA, DBMS, OS, OOP, ML", required: true }
  ] },
  { type: "ACHIEVEMENT", label: "Achievement", helper: "Achievement needs title, metric, and context.", fields: [
    { name: "achievement", label: "Achievement", placeholder: "Hackathon finalist", required: true },
    { name: "metric", label: "Metric", placeholder: "Top 50 of 880+ teams" },
    { name: "context", label: "Context", placeholder: "Built AI healthcare platform", kind: "textarea" }
  ] },
  { type: "POSITION_OF_RESPONSIBILITY", label: "Responsibility", helper: "Leadership/responsibility nodes use role, organization, timeline, and bullets.", fields: [
    { name: "role", label: "Role", placeholder: "Vice President", required: true },
    { name: "organization", label: "Organization", placeholder: "Community / club / institute", required: true },
    { name: "timeline", label: "Timeline", placeholder: "2026 - Present" },
    { name: "bullets", label: "Bullets", placeholder: "One bullet per line.", kind: "textarea", required: true }
  ] },
  { type: "CERTIFICATION", label: "Certificate", helper: "Certificate nodes track issuer and credential link.", fields: [
    { name: "certificateName", label: "Certificate name", placeholder: "AWS Cloud Practitioner", required: true },
    { name: "issuer", label: "Issuer", placeholder: "Amazon Web Services" },
    { name: "credentialLink", label: "Credential link", placeholder: "https://..." }
  ] },
  { type: "EXPERIENCE", label: "Experience", helper: "Experience uses role, company, timeline, and impact bullets.", fields: [
    { name: "role", label: "Role", placeholder: "Software Engineer Intern", required: true },
    { name: "company", label: "Company", placeholder: "Company name", required: true },
    { name: "timeline", label: "Timeline", placeholder: "May 2026 - Jul 2026" },
    { name: "bullets", label: "Bullets", placeholder: "One bullet per line.", kind: "textarea", required: true }
  ] },
  { type: "CUSTOM", label: "Custom", helper: "For anything else.", fields: [
    { name: "title", label: "Title", placeholder: "Custom node", required: true },
    { name: "details", label: "Details", placeholder: "Details", kind: "textarea", required: true }
  ] }
];
