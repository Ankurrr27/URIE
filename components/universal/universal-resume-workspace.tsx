"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Brain, Plus } from "lucide-react";
import type { CareerNodeType } from "@/types/career-node";
import { careerNodeFormConfigs, type CareerNodeFieldConfig } from "@/features/career-nodes/node-form-config";
import { buildNodePayload, estimateEvidenceLevel, estimateImpact } from "@/features/career-nodes/node-payload";
import { formatApiError } from "@/lib/client/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function UniversalResumeWorkspace() {
  const [type, setType] = useState<CareerNodeType>("PROJECT");
  const selectedType = careerNodeFormConfigs.find((item) => item.type === type) ?? careerNodeFormConfigs[0];
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
            evidenceLevel: estimateEvidenceLevel(nodePayload.summary),
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
    <div className="max-w-xl">
      <Card className="surface-panel shadow-xs">
        <CardHeader className="pb-2 p-4 sm:p-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-primary" />
            Add career node
          </CardTitle>
          <CardDescription className="text-xs">Store every reusable career fact once, then reuse it across resumes.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          <form action={createNode} className="space-y-3.5">
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
  );
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
