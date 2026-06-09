"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Brain, Plus, Sparkles } from "lucide-react";
import type { CareerNodeType } from "@/types/career-node";
import { careerNodeFormConfigs, type CareerNodeFieldConfig } from "@/features/career-nodes/node-form-config";
import { buildNodePayload, estimateEvidenceLevel, estimateImpact, parseBullets } from "@/features/career-nodes/node-payload";
import { formatApiError } from "@/lib/client/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export interface SerializedCareerNode {
  id: string;
  type: string;
  title: string;
  organization: string | null;
  summary: string | null;
  skills: string[];
  keywords: string[];
  tags: string[];
  updatedAt: string;
}

const categoryOrder = [
  "CONTACT_INFO",
  "SOCIAL_HANDLE",
  "CODING_PROFILE",
  "SUMMARY",
  "EDUCATION",
  "SKILL",
  "PROJECT",
  "EXPERIENCE",
  "CERTIFICATION",
  "ACHIEVEMENT",
  "RELEVANT_COURSEWORK",
  "POSITION_OF_RESPONSIBILITY",
  "CUSTOM"
];

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function UniversalResumeWorkspace({ initialNodes }: { initialNodes: SerializedCareerNode[] }) {
  const [nodes, setNodes] = useState<SerializedCareerNode[]>(initialNodes);
  const [type, setType] = useState<CareerNodeType>("PROJECT");
  const selectedType = careerNodeFormConfigs.find((item) => item.type === type) ?? careerNodeFormConfigs[0];
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

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
            evidenceLevel: estimateEvidenceLevel(nodePayload.summary),
            isCurrent: false,
            visibility: true
          })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(formatApiError(payload));

        const newNode = payload.data;
        if (newNode) {
          setNodes((prev) => [newNode, ...prev]);
        }

        formRef.current?.reset();
        toast.success("Career node added to your universal resume");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not create node");
      }
    });
  }

  const grouped = categoryOrder
    .map((cat) => ({
      type: cat,
      label: titleCase(cat),
      nodes: nodes.filter((node) => node.type === cat)
    }))
    .filter((group) => group.nodes.length);

  return (
    <div className="grid gap-6 lg:grid-cols-[450px_1fr] items-start">
      {/* Left Form */}
      <div className="w-full">
        <Card className="surface-panel shadow-xs">
          <CardHeader className="pb-2 p-4 sm:p-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-5 w-5 text-primary" />
              Add career node
            </CardTitle>
            <CardDescription className="text-xs">Store every reusable career fact once, then reuse it across resumes.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <form ref={formRef} action={createNode} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="nodeTypeSelect" className="text-xs text-muted-foreground">Fact category structure</Label>
                <select
                  id="nodeTypeSelect"
                  className="h-8.5 w-full rounded-md border border-input bg-background px-3 text-xs focus-ring"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  {careerNodeFormConfigs.map((item) => (
                    <option key={item.type} value={item.type}>
                      {item.label} Presets
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-md border bg-accent/20 p-2.5 text-[11px] text-muted-foreground leading-normal">
                {selectedType.helper}
              </div>
              <div className="space-y-3">
                {selectedType.fields.map((field) => <DynamicField key={field.name} field={field} />)}
              </div>
              <Button disabled={pending} className="w-full h-8.5 text-xs pt-1">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add to universal resume
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Resume Display */}
      <div className="space-y-4">
        <Card className="border bg-card shadow-xs">
          <CardHeader className="pb-2 p-4 sm:p-5">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
              Universal Resume Preview
            </CardTitle>
            <CardDescription className="text-xs">
              A real-time master view of every career node saved in URIE.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0 max-h-[70vh] overflow-y-auto space-y-4 pr-2 scrollbar-thin">
            {grouped.length ? (
              grouped.map((group) => (
                <div key={group.type} className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80 border-b pb-1">
                    {group.label}
                  </h3>
                  <div className="grid gap-2.5">
                    {group.nodes.map((node) => (
                      <div key={node.id} className="rounded-lg border bg-accent/5 p-4 space-y-3 border-border/60 hover:border-primary/45 transition-colors shadow-2xs">
                        <NodeContentPreview node={node} />
                        {[...node.skills, ...node.keywords, ...node.tags].length ? (
                          <div className="flex flex-wrap gap-1 pt-1 border-t border-dashed mt-2">
                            {[...new Set([...node.skills, ...node.keywords, ...node.tags])].slice(0, 8).map((item) => (
                              <Badge key={item} variant="outline" className="text-[9px] px-1 py-0">{item}</Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Brain className="h-8 w-8 text-muted-foreground/60 mb-2.5 animate-pulse" />
                <p className="text-xs text-muted-foreground">No universal resume nodes yet. Add your first node using the form on the left.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatBulletText(text: string) {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function NodeContentPreview({ node }: { node: any }) {
  const content = typeof node.content === "string" ? JSON.parse(node.content) : (node.content || {});

  switch (node.type) {
    case "PROJECT": {
      const projectName = node.title;
      const timeline = content.timeline || node.organization || "";
      const liveLink = content.liveLink || "";
      const bullets = parseBullets(
        Array.isArray(content.bullets)
          ? content.bullets.join("\n")
          : (node.summary || "")
      );

      return (
        <div className="space-y-1.5 font-serif text-[12px] text-foreground/90">
          <div className="flex justify-between items-baseline gap-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-foreground text-[13px]">{projectName}</span>
              {liveLink && (
                <>
                  <span className="text-muted-foreground font-normal">-</span>
                  <a 
                    href={liveLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 dark:text-blue-400 hover:underline font-normal text-[12px] inline-flex items-center gap-0.5"
                  >
                    Click here
                  </a>
                </>
              )}
            </div>
            {timeline && <span className="text-[11px] font-medium text-muted-foreground shrink-0">{timeline}</span>}
          </div>
          {bullets.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground/90 leading-normal">
              {bullets.map((b: string, i: number) => (
                <li key={i}>{formatBulletText(b)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic text-[11px]">No details provided.</p>
          )}
        </div>
      );
    }

    case "EXPERIENCE": {
      const role = node.title;
      const company = node.organization || "";
      const timeline = content.timeline || "";
      const bullets = parseBullets(
        Array.isArray(content.bullets)
          ? content.bullets.join("\n")
          : (node.summary || "")
      );

      return (
        <div className="space-y-1.5 font-serif text-[12px] text-foreground/90">
          <div className="flex justify-between items-baseline gap-4">
            <div>
              <span className="font-bold text-foreground text-[13px]">{role}</span>
              {company && <span className="text-muted-foreground font-medium ml-1.5">| {company}</span>}
            </div>
            {timeline && <span className="text-[11px] font-medium text-muted-foreground shrink-0">{timeline}</span>}
          </div>
          {bullets.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground/90 leading-normal">
              {bullets.map((b: string, i: number) => (
                <li key={i}>{formatBulletText(b)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic text-[11px]">No experience details provided.</p>
          )}
        </div>
      );
    }

    case "POSITION_OF_RESPONSIBILITY": {
      const role = node.title;
      const organization = node.organization || "";
      const timeline = content.timeline || "";
      const bullets = parseBullets(
        Array.isArray(content.bullets)
          ? content.bullets.join("\n")
          : (node.summary || "")
      );

      return (
        <div className="space-y-1.5 font-serif text-[12px] text-foreground/90">
          <div className="flex justify-between items-baseline gap-4">
            <div>
              <span className="font-bold text-foreground text-[13px]">{role}</span>
              {organization && <span className="text-muted-foreground font-medium ml-1.5">| {organization}</span>}
            </div>
            {timeline && <span className="text-[11px] font-medium text-muted-foreground shrink-0">{timeline}</span>}
          </div>
          {bullets.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground/90 leading-normal">
              {bullets.map((b: string, i: number) => (
                <li key={i}>{formatBulletText(b)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic text-[11px]">No details provided.</p>
          )}
        </div>
      );
    }

    default: {
      return (
        <div className="space-y-1.5 font-serif text-[12px] text-foreground/90">
          <div className="flex justify-between items-baseline gap-3">
            <span className="font-bold text-foreground text-[13px]">{node.title}</span>
            {node.organization && <span className="text-[11px] font-medium text-muted-foreground">{node.organization}</span>}
          </div>
          {node.summary && <p className="text-muted-foreground/95 whitespace-pre-wrap leading-normal">{node.summary}</p>}
        </div>
      );
    }
  }
}

function DynamicField({ field }: { field: CareerNodeFieldConfig }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={field.name} className="text-xs text-muted-foreground">{field.label}</Label>
      {field.kind === "textarea" ? (
        <Textarea id={field.name} name={field.name} placeholder={field.placeholder} required={field.required} className="text-xs min-h-16" />
      ) : (
        <Input id={field.name} name={field.name} placeholder={field.placeholder} required={field.required} className="h-8.5 text-xs" />
      )}
    </div>
  );
}
