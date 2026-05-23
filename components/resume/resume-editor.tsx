"use client";

import { useEffect } from "react";
import { GripVertical, Link2, Palette, Plus, Save, Type, Underline } from "lucide-react";
import type { Resume } from "@/types/resume";
import { useResumeStore } from "@/store/resume-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ResumePreview } from "@/components/resume/resume-preview";

export function ResumeEditor({ resume }: { resume: Resume }) {
  const { activeResume, setActiveResume, updateSection } = useResumeStore();
  const { updateSettings, updateContact } = useResumeStore();

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
        <CardContent className="space-y-5">
          <div className="rounded-md border bg-accent/25 p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Palette className="h-4 w-4 text-primary" />
              Simple style controls
            </div>
            <div className="grid gap-3">
              <label className="grid gap-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Type className="h-3 w-3" /> Text size</span>
                <select
                  className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
                  value={String(current.settings.textSize ?? "compact")}
                  onChange={(event) => updateSettings({ textSize: event.target.value })}
                >
                  <option value="compact">Compact one-page</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="large">Large</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs text-muted-foreground">
                Accent color
                <input
                  type="color"
                  className="h-9 w-full rounded-md border bg-background p-1"
                  value={String(current.settings.accentColor ?? "#0f8fa3")}
                  onChange={(event) => updateSettings({ accentColor: event.target.value })}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={Boolean(current.settings.underlineSections ?? true)}
                    onChange={(event) => updateSettings({ underlineSections: event.target.checked })}
                  />
                  <Underline className="h-3 w-3" /> Section lines
                </label>
                <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={Boolean(current.settings.underlineLinks ?? true)}
                    onChange={(event) => updateSettings({ underlineLinks: event.target.checked })}
                  />
                  <Link2 className="h-3 w-3" /> Underline links
                </label>
              </div>
              <div className="grid gap-2">
                <input
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  placeholder="Portfolio / website link"
                  value={String(current.contact.website ?? "")}
                  onChange={(event) => updateContact({ website: event.target.value })}
                />
                <input
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  placeholder="LinkedIn / GitHub / LeetCode links"
                  value={String(current.contact.links ?? "")}
                  onChange={(event) => updateContact({ links: event.target.value })}
                />
              </div>
            </div>
          </div>
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
