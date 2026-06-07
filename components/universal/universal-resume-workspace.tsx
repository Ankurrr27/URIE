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
              {careerNodeFormConfigs.map((item) => (
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

function DynamicField({ field }: { field: CareerNodeFieldConfig }) {
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
