"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Brain, Plus } from "lucide-react";
import type { CareerNodeType } from "@/types/career-node";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FieldConfig = { name: string; label: string; placeholder: string; kind?: "input" | "textarea"; required?: boolean };
type NodeConfig = { type: CareerNodeType; label: string; helper: string; fields: FieldConfig[] };

const nodeTypes: NodeConfig[] = [
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

export function UniversalResumeWorkspace() {
  const [type, setType] = useState<CareerNodeType>("PROJECT");
  const selectedType = nodeTypes.find((item) => item.type === type) ?? nodeTypes[0];
  const [pending, startTransition] = useTransition();

  async function createNode(formData: FormData) {
    const nodePayload = buildNodePayload(type, formData);

    startTransition(async () => {
      try {
        if (nodePayload.title.length < 2) throw new Error("Please fill the required title field.");
        if (!nodePayload.summary) throw new Error("Please fill the required details field.");
        const response = await fetch("/api/career-nodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            title: nodePayload.title,
            organization: nodePayload.organization,
            summary: nodePayload.summary,
            content: nodePayload.content,
            tags: nodePayload.tags,
            skills: nodePayload.skills,
            keywords: nodePayload.keywords,
            impactScore: estimateImpact(nodePayload.summary),
            evidenceLevel: /\d+%|\$\d+|\d+x|\d+\s+(users|customers|requests)/i.test(nodePayload.summary) ? 4 : 2,
            isCurrent: false,
            visibility: true
          })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(formatApiError(payload));
        toast.success("Career node added to your universal resume");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not create node");
      }
    });
  }

  return (
    <div className="max-w-3xl">
      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Add career node
          </CardTitle>
          <CardDescription>Store every reusable career fact once, then reuse it across resumes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createNode} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {nodeTypes.map((item) => (
                <Button key={item.type} type="button" variant={type === item.type ? "default" : "secondary"} size="sm" onClick={() => setType(item.type)}>
                  {item.label}
                </Button>
              ))}
            </div>
            <div className="rounded-md border bg-accent/30 p-3 text-xs text-muted-foreground">
              {selectedType.helper}
            </div>
            {selectedType.fields.map((field) => <DynamicField key={field.name} field={field} />)}
            <Button disabled={pending} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add to universal resume
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function DynamicField({ field }: { field: FieldConfig }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{field.label}</Label>
      {field.kind === "textarea" ? (
        <Textarea id={field.name} name={field.name} placeholder={field.placeholder} required={field.required} />
      ) : (
        <Input id={field.name} name={field.name} placeholder={field.placeholder} required={field.required} />
      )}
    </div>
  );
}

function buildNodePayload(type: CareerNodeType, formData: FormData) {
  const get = (name: string) => String(formData.get(name) ?? "").trim();
  const bullets = get("bullets").split(/\n+/).map((item) => item.trim()).filter(Boolean);
  const content = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, String(value).trim()]));

  switch (type) {
    case "SKILL": {
      const domain = get("domain");
      const skillName = get("skillName");
      return {
        title: skillName,
        organization: domain || null,
        summary: `${skillName}${domain ? ` in ${domain}` : ""}`,
        content,
        skills: [skillName].filter(Boolean),
        keywords: [skillName, domain].filter(Boolean),
        tags: [domain].filter(Boolean)
      };
    }
    case "PROJECT": {
      const title = get("projectName");
      return {
        title,
        organization: get("timeline") || null,
        summary: bullets.join(" "),
        content: { ...content, bullets },
        skills: [],
        keywords: splitList(get("projectName")),
        tags: splitList(get("timeline"))
      };
    }
    case "EDUCATION":
      return {
        title: get("course"),
        organization: get("college") || null,
        summary: [get("college"), get("course"), get("cgpa"), get("graduationDate")].filter(Boolean).join(" | "),
        content,
        skills: [],
        keywords: splitList(`${get("course")}, ${get("college")}`),
        tags: ["education"]
      };
    case "CONTACT_INFO":
      return {
        title: get("email") || "Contact info",
        organization: get("location") || null,
        summary: [get("email"), get("phone"), get("location"), get("portfolio")].filter(Boolean).join(" | "),
        content,
        skills: [],
        keywords: [],
        tags: ["contact"]
      };
    case "SOCIAL_HANDLE":
    case "CODING_PROFILE":
      return {
        title: get("platform"),
        organization: get("url") || null,
        summary: [get("platform"), get("url"), get("stats")].filter(Boolean).join(" | "),
        content,
        skills: [],
        keywords: [get("platform")].filter(Boolean),
        tags: [type === "CODING_PROFILE" ? "coding" : "social"]
      };
    case "RELEVANT_COURSEWORK":
      return {
        title: "Relevant Coursework",
        organization: null,
        summary: get("courses"),
        content: { ...content, courses: splitList(get("courses")) },
        skills: splitList(get("courses")),
        keywords: splitList(get("courses")),
        tags: ["coursework"]
      };
    case "ACHIEVEMENT":
      return {
        title: get("achievement"),
        organization: get("metric") || null,
        summary: [get("achievement"), get("metric"), get("context")].filter(Boolean).join(" - "),
        content,
        skills: [],
        keywords: splitList(`${get("achievement")}, ${get("metric")}`),
        tags: ["achievement"]
      };
    case "POSITION_OF_RESPONSIBILITY":
    case "EXPERIENCE":
      return {
        title: get("role"),
        organization: get("organization") || get("company") || null,
        summary: bullets.join(" "),
        content: { ...content, bullets },
        skills: [],
        keywords: splitList(`${get("role")}, ${get("organization")}, ${get("company")}`),
        tags: [type === "EXPERIENCE" ? "experience" : "responsibility"]
      };
    case "CERTIFICATION":
      return {
        title: get("certificateName"),
        organization: get("issuer") || null,
        summary: [get("certificateName"), get("issuer"), get("credentialLink")].filter(Boolean).join(" | "),
        content,
        skills: [],
        keywords: splitList(`${get("certificateName")}, ${get("issuer")}`),
        tags: ["certificate"]
      };
    default:
      return {
        title: get("title"),
        organization: null,
        summary: get("details"),
        content,
        skills: [],
        keywords: [],
        tags: ["custom"]
      };
  }
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function estimateImpact(value: string) {
  let score = 35;
  if (/\d+%|\$\d+|\d+x/i.test(value)) score += 35;
  if (/led|owned|built|launched|improved|reduced|increased|automated/i.test(value)) score += 20;
  return Math.min(100, score);
}

function formatApiError(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "details" in payload.error
  ) {
    const details = payload.error.details as { fieldErrors?: Record<string, string[]> };
    const first = Object.entries(details.fieldErrors ?? {}).find(([, messages]) => messages.length);
    if (first) return `${first[0]}: ${first[1][0]}`;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error
  ) {
    return String(payload.error.message);
  }

  return "Request failed";
}
