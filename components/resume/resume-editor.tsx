"use client";

import { useEffect } from "react";
import { GripVertical, Plus, Save } from "lucide-react";
import type { Resume } from "@/types/resume";
import { useResumeStore } from "@/store/resume-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ResumePreview } from "@/components/resume/resume-preview";

export function ResumeEditor({ resume }: { resume: Resume }) {
  const { activeResume, setActiveResume, updateSection } = useResumeStore();

  useEffect(() => setActiveResume(resume), [resume, setActiveResume]);
  const current = activeResume ?? resume;

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>{current.title}</CardTitle>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {current.sections.map((section) => (
            <div key={section.id} className="rounded-md border p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                {section.title}
              </div>
              <Textarea
                value={typeof section.content.text === "string" ? section.content.text : JSON.stringify(section.content, null, 2)}
                onChange={(event) => updateSection(section.id, { content: { ...section.content, text: event.target.value } })}
                placeholder="Write achievement-focused content..."
              />
            </div>
          ))}
          <Button variant="secondary" className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add section
          </Button>
        </CardContent>
      </Card>
      <ResumePreview resume={current} />
    </div>
  );
}
