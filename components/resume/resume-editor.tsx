"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileCode2,
  FileText,
  GripVertical,
  Loader2,
  Plus,
  PlusCircle,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  X,
  XCircle
} from "lucide-react";
import type { Resume, ResumeSection } from "@/types/resume";
import { useResumeStore } from "@/store/resume-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumePreview } from "@/components/resume/resume-preview";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CareerNode = {
  id: string;
  type: string;
  title: string;
  organization: string | null;
  summary: string | null;
  skills: string[];
};

export function ResumeEditor({ resume }: { resume: Resume }) {
  const router = useRouter();
  const { activeResume, setActiveResume, updateSection, updateSettings, updateContact } = useResumeStore();
  const [saving, startSave] = useTransition();

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Dialog and panel states
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionType, setNewSectionType] = useState<string>("EXPERIENCE");

  // Career Library Node importing
  const [showImportNode, setShowImportNode] = useState<string | null>(null); // sectionId
  const [careerNodes, setCareerNodes] = useState<CareerNode[]>([]);
  const [loadingNodes, setLoadingNodes] = useState(false);

  // Direct ATS Scan States
  const [showAtsScan, setShowAtsScan] = useState(false);
  const [atsJobTitle, setAtsJobTitle] = useState("");
  const [atsCompany, setAtsCompany] = useState("");
  const [atsJobDescription, setAtsJobDescription] = useState("");
  const [atsReport, setAtsReport] = useState<any>(null);
  const [atsScanning, setAtsScanning] = useState(false);

  // AI suggestion state
  const [aiLoadingSection, setAiLoadingSection] = useState<string | null>(null);

  useEffect(() => {
    setActiveResume(resume);
  }, [resume, setActiveResume]);

  const current = activeResume ?? resume;

  // Load career nodes for importing
  async function loadCareerNodes() {
    setLoadingNodes(true);
    try {
      const response = await fetch("/api/career-nodes");
      const payload = await response.json();
      if (response.ok && payload.data) {
        setCareerNodes(payload.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNodes(false);
    }
  }

  // Handle Save
  function handleSave() {
    startSave(async () => {
      try {
        const response = await fetch(`/api/resumes/${current.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: current.title,
            contact: current.contact,
            settings: current.settings,
            sections: current.sections
          })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Save failed");
        setActiveResume(payload.data);
        toast.success("Resume saved successfully");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Save failed");
      }
    });
  }

  // LaTeX Export
  function exportToLatex() {
    const latex = `% URIE LaTeX Export Template
\\documentclass[10pt]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{enumitem}
\\begin{document}
\\begin{center}
{\\LARGE \\textbf{${current.contact.name || "Your Name"}}}\\\\\n` +
      `${[current.contact.email, current.contact.phone, current.contact.location].filter(Boolean).join(" | ")}` +
      `\n\\end{center}\n\n` +
      current.sections
        .filter((s) => s.visible)
        .map((sec) => {
          let body = "";
          if (typeof sec.content.text === "string" && sec.content.text) {
            const items = sec.content.text.split(/\n|•|\*/).map(i => i.trim()).filter(Boolean);
            if (items.length > 1) {
              body = `\\begin{itemize}[leftmargin=*]\n${items.map(item => `  \\item ${item}`).join('\n')}\n\\end{itemize}`;
            } else {
              body = sec.content.text;
            }
          } else if (typeof sec.content.summary === "string" && sec.content.summary) {
            const items = sec.content.summary.split(/\n|•|\*/).map(i => i.trim()).filter(Boolean);
            if (items.length > 1) {
              body = `\\textbf{${sec.content.organization || ""}} \\hfill \\\\\n\\begin{itemize}[leftmargin=*]\n${items.map(item => `  \\item ${item}`).join('\n')}\n\\end{itemize}`;
            } else {
              body = `\\textbf{${sec.content.organization || ""}} \\hfill \\\\\n${sec.content.summary}`;
            }
            if (Array.isArray(sec.content.skills) && sec.content.skills.length) {
              body += `\\\\\n\\textit{Skills:} ${sec.content.skills.join(", ")}`;
            }
          } else if (Array.isArray(sec.content.items) && sec.content.items.length) {
            body = `\\begin{itemize}[leftmargin=*]\n${sec.content.items.map((item) => `\\item ${item}`).join("\n")}\n\\end{itemize}`;
          }
          return `\\section*{${sec.title}}\n${body}`;
        })
        .join("\n\n") +
      `\n\\end{document}`;

    window.localStorage.setItem("resubee-latex-source", latex);
    toast.success("Formated to LaTeX! Redirecting to Editor...");
    router.push("/dashboard/latex");
  }

  // ATS Scan
  async function runAtsScan() {
    if (atsJobDescription.length < 80) {
      toast.error("Job description must be at least 80 characters.");
      return;
    }
    setAtsScanning(true);
    setAtsReport(null);
    try {
      const response = await fetch("/api/ats/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: current.id,
          jobDescription: atsJobDescription,
          jobTitle: atsJobTitle || undefined,
          company: atsCompany || undefined
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "ATS scan failed");
      setAtsReport(payload.data);
      toast.success("ATS score generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ATS scan failed");
    } finally {
      setAtsScanning(false);
    }
  }

  // Import career node values
  function doImportNode(sectionId: string, node: CareerNode) {
    const section = current.sections.find((s) => s.id === sectionId);
    if (!section) return;

    // Detect format and assign values
    const textVal = typeof section.content.text === "string" ? "text" : typeof section.content.summary === "string" ? "structured" : Array.isArray(section.content.items) ? "bullets" : "text";

    if (textVal === "text") {
      updateSection(sectionId, {
        content: { text: node.summary || "" }
      });
    } else if (textVal === "structured") {
      updateSection(sectionId, {
        content: {
          organization: node.organization || node.title,
          summary: node.summary || "",
          skills: node.skills
        }
      });
    } else {
      // Bullets format: split by bullet character or newline
      const bullets = (node.summary || "")
        .split(/\n|•|\*/)
        .map((b) => b.trim())
        .filter(Boolean);
      updateSection(sectionId, {
        content: { items: bullets.length ? bullets : ["New item"] }
      });
    }

    setShowImportNode(null);
    toast.success(`Imported data from node: ${node.title}`);
  }

  // Trigger AI advice
  async function runAiOptimize(sectionId: string, key: "text" | "summary") {
    const section = current.sections.find((s) => s.id === sectionId);
    if (!section) return;
    const value = section.content[key];
    if (typeof value !== "string" || !value.trim()) {
      toast.error("Please enter some text in the field first.");
      return;
    }

    setAiLoadingSection(sectionId);
    try {
      const response = await fetch("/api/ai/bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "AI Optimization failed");
      
      const newContent = { ...section.content, [key]: payload.data.text };
      updateSection(sectionId, { content: newContent });
      toast.success("AI optimized successfully!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setAiLoadingSection(null);
    }
  }

  // Create section
  function createSection() {
    if (!newSectionTitle.trim()) {
      toast.error("Please enter a section title.");
      return;
    }
    // Generate 24-character hexadecimal MongoDB ObjectId
    const newId = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    
    // Default content layout
    let defaultContent: any = { text: "" };
    if (newSectionType === "EXPERIENCE" || newSectionType === "PROJECTS") {
      defaultContent = { organization: "New Entry", summary: "Description details", skills: [] };
    } else if (newSectionType === "EDUCATION") {
      defaultContent = { items: ["College Degree - Major Name", "College Name", "GPA Details"] };
    }

    const newSec: ResumeSection = {
      id: newId,
      type: newSectionType as any,
      title: newSectionTitle,
      content: defaultContent,
      position: current.sections.length,
      visible: true
    };

    useResumeStore.setState((state) => ({
      activeResume: state.activeResume
        ? { ...state.activeResume, sections: [...state.activeResume.sections, newSec] }
        : null
    }));

    setShowAddSection(false);
    setNewSectionTitle("");
    toast.success(`Created section: ${newSectionTitle}`);
  }

  // Delete section
  function deleteSection(sectionId: string) {
    useResumeStore.setState((state) => ({
      activeResume: state.activeResume
        ? { ...state.activeResume, sections: state.activeResume.sections.filter((s) => s.id !== sectionId) }
        : null
    }));
    toast.success("Section removed");
  }

  // Change order
  function moveSection(index: number, direction: "up" | "down") {
    const sections = [...current.sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    // Swap positions
    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;

    // Update index positions
    const reordered = sections.map((s, idx) => ({ ...s, position: idx }));

    useResumeStore.setState((state) => ({
      activeResume: state.activeResume ? { ...state.activeResume, sections: reordered } : null
    }));
  }

  return (
    <div className="space-y-4">
      {/* Mobile Tab Selector */}
      <div className="flex lg:hidden border-b border-border/80 bg-muted/30 p-1 rounded-lg">
        <button
          type="button"
          className={cn(
            "flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all",
            activeTab === "edit" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab("edit")}
        >
          Form Editor
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all",
            activeTab === "preview" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab("preview")}
        >
          Resume Preview
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[400px_1fr] relative select-none">
        
        {/* Editor Sidebar */}
        <div className={cn("space-y-4", activeTab === "edit" ? "block" : "hidden lg:block")}>
        
        {/* Editor controls */}
        <Card className="surface-panel shadow-xs">
          <CardHeader className="pb-2 flex flex-col space-y-1.5 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px] tracking-wider uppercase font-semibold">Builder</Badge>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="h-7.5 px-2.5 text-[11px]" onClick={() => setShowAtsScan(true)}>
                  <Activity className="mr-1 h-3.5 w-3.5" /> Scan
                </Button>
                <Button size="sm" variant="outline" className="h-7.5 px-2.5 text-[11px]" onClick={exportToLatex}>
                  <FileCode2 className="mr-1 h-3.5 w-3.5" /> LaTeX
                </Button>
                <Button size="sm" className="h-7.5 px-2.5 text-[11px]" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
                  Save
                </Button>
              </div>
            </div>
            <div className="pt-2">
              <Input
                className="h-8.5 font-semibold text-sm focus-ring bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none"
                value={current.title}
                onChange={(e) => useResumeStore.setState((state) => ({ activeResume: state.activeResume ? { ...state.activeResume, title: e.target.value } : null }))}
                placeholder="Untitled Resume"
              />
              <p className="text-[10px] text-muted-foreground">Title details will show in resume versions.</p>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
            
            {/* Style parameters */}
            <div className="rounded-md border bg-accent/15 p-2.5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-medium">
                <Settings2 className="h-3.5 w-3.5 text-primary" /> Accent / Layout settings
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1">
                  <span className="text-[10px] text-muted-foreground">Accent Color</span>
                  <input
                    type="color"
                    className="h-7 w-full rounded border bg-background p-0.5 cursor-pointer"
                    value={String(current.settings.accentColor ?? "#0f8fa3")}
                    onChange={(event) => updateSettings({ accentColor: event.target.value })}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] text-muted-foreground">Text Size</span>
                  <select
                    className="h-7 rounded border bg-background px-1 text-[11px]"
                    value={String(current.settings.textSize ?? "compact")}
                    onChange={(event) => updateSettings({ textSize: event.target.value })}
                  >
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="large">Large</option>
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-3 w-3 accent-primary"
                    checked={Boolean(current.settings.underlineSections ?? true)}
                    onChange={(event) => updateSettings({ underlineSections: event.target.checked })}
                  />
                  <span>Section lines</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-3 w-3 accent-primary"
                    checked={Boolean(current.settings.underlineLinks ?? true)}
                    onChange={(event) => updateSettings({ underlineLinks: event.target.checked })}
                  />
                  <span>Underline links</span>
                </label>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2 rounded-md border p-2.5">
              <div className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">Contact Headers</div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  className="h-8 text-xs"
                  placeholder="Full Name"
                  value={String(current.contact.name ?? "")}
                  onChange={(e) => updateContact({ name: e.target.value })}
                />
                <Input
                  className="h-8 text-xs"
                  placeholder="Email Address"
                  value={String(current.contact.email ?? "")}
                  onChange={(e) => updateContact({ email: e.target.value })}
                />
                <Input
                  className="h-8 text-xs"
                  placeholder="Phone Number"
                  value={String(current.contact.phone ?? "")}
                  onChange={(e) => updateContact({ phone: e.target.value })}
                />
                <Input
                  className="h-8 text-xs"
                  placeholder="City, Country"
                  value={String(current.contact.location ?? "")}
                  onChange={(e) => updateContact({ location: e.target.value })}
                />
              </div>
              <Input
                className="h-8 text-xs"
                placeholder="Personal Website URL (e.g. portfolio.com)"
                value={String(current.contact.website ?? "")}
                onChange={(e) => updateContact({ website: e.target.value })}
              />
              <Input
                className="h-8 text-xs"
                placeholder="Social Links (e.g. GitHub, LinkedIn handles)"
                value={String(current.contact.links ?? "")}
                onChange={(e) => updateContact({ links: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sections Listing */}
        <div className="space-y-3">
          {current.sections.map((section, idx) => {
            const format = typeof section.content.text === "string" ? "text" : typeof section.content.summary === "string" ? "structured" : Array.isArray(section.content.items) ? "bullets" : "text";
            
            return (
              <Card key={section.id} className="surface-panel shadow-xs overflow-hidden">
                <CardHeader className="pb-2 p-3 flex flex-row items-center justify-between bg-accent/10 border-b">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0 cursor-grab" />
                    <Input
                      className="h-7 text-xs font-semibold bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none truncate"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => updateSection(section.id, { visible: !section.visible })}
                      title={section.visible ? "Hide section" : "Show section"}
                    >
                      {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => {
                        setShowImportNode(section.id);
                        void loadCareerNodes();
                      }}
                      title="Import from Career Library"
                    >
                      <Brain className="h-3.5 w-3.5 text-primary" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" disabled={idx === 0} onClick={() => moveSection(idx, "up")}>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" disabled={idx === current.sections.length - 1} onClick={() => moveSection(idx, "down")}>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-destructive" onClick={() => deleteSection(section.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 space-y-2 pt-2 text-xs">
                  
                  {/* Format Selector */}
                  <div className="flex gap-2.5 pb-2 text-[10px] text-muted-foreground">
                    <span>Format Layout:</span>
                    <button
                      type="button"
                      className={`font-semibold hover:text-primary transition ${format === "text" ? "text-primary underline" : ""}`}
                      onClick={() => updateSection(section.id, { content: { text: section.content.summary || "" } })}
                    >
                      Paragraph Text
                    </button>
                    <button
                      type="button"
                      className={`font-semibold hover:text-primary transition ${format === "structured" ? "text-primary underline" : ""}`}
                      onClick={() => updateSection(section.id, { content: { organization: "Heading", summary: section.content.text || "", skills: [] } })}
                    >
                      Structured
                    </button>
                    <button
                      type="button"
                      className={`font-semibold hover:text-primary transition ${format === "bullets" ? "text-primary underline" : ""}`}
                      onClick={() => updateSection(section.id, { content: { items: [section.content.text || "Bullet point details"] } })}
                    >
                      Bullets List
                    </button>
                  </div>

                  {/* Rendering editors dynamically */}
                  {format === "text" && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] text-muted-foreground">Section Details</Label>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 text-primary"
                          onClick={() => runAiOptimize(section.id, "text")}
                          disabled={aiLoadingSection === section.id}
                        >
                          {aiLoadingSection === section.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                      <Textarea
                        className="text-xs min-h-24 leading-normal"
                        value={String(section.content.text ?? "")}
                        onChange={(e) => updateSection(section.id, { content: { text: e.target.value } })}
                        placeholder="Detail professional summaries, tags, or skills..."
                      />
                    </div>
                  )}

                  {format === "structured" && (
                    <div className="space-y-2">
                      <div className="grid gap-1">
                        <Label className="text-[10px] text-muted-foreground">Organization / Heading Title</Label>
                        <Input
                          className="h-8 text-xs"
                          value={String(section.content.organization ?? "")}
                          onChange={(e) => updateSection(section.id, { content: { ...section.content, organization: e.target.value } })}
                          placeholder="Stripe / Vibe Project"
                        />
                      </div>
                      <div className="grid gap-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] text-muted-foreground">Summary Description</Label>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 text-primary"
                            onClick={() => runAiOptimize(section.id, "summary")}
                            disabled={aiLoadingSection === section.id}
                          >
                            {aiLoadingSection === section.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                        <Textarea
                          className="text-xs min-h-16 leading-normal"
                          value={String(section.content.summary ?? "")}
                          onChange={(e) => updateSection(section.id, { content: { ...section.content, summary: e.target.value } })}
                          placeholder="Project achievement summary..."
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-[10px] text-muted-foreground">Skills (comma separated)</Label>
                        <Input
                          className="h-8 text-xs"
                          value={Array.isArray(section.content.skills) ? section.content.skills.join(", ") : ""}
                          onChange={(e) => updateSection(section.id, { content: { ...section.content, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })}
                          placeholder="TypeScript, Next.js, Prisma"
                        />
                      </div>
                    </div>
                  )}

                  {format === "bullets" && (
                    <div className="space-y-2">
                      <Label className="text-[10px] text-muted-foreground">Bullet Achievements</Label>
                      <div className="space-y-1.5">
                        {Array.isArray(section.content.items) && section.content.items.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex gap-1.5 items-start">
                            <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            <Input
                              className="h-8 text-xs flex-1"
                              value={String(bullet)}
                              onChange={(e) => {
                                const newItems = [...(section.content.items as string[])];
                                newItems[bIdx] = e.target.value;
                                updateSection(section.id, { content: { ...section.content, items: newItems } });
                              }}
                            />
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-destructive mt-2.5 shrink-0"
                              onClick={() => {
                                const newItems = (section.content.items as string[]).filter((_, i) => i !== bIdx);
                                updateSection(section.id, { content: { ...section.content, items: newItems } });
                              }}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-[10px] text-primary h-6 px-1.5 mt-1"
                          onClick={() => {
                            const newItems = Array.isArray(section.content.items) ? [...section.content.items, "New bullet point achievement"] : ["New bullet point achievement"];
                            updateSection(section.id, { content: { ...section.content, items: newItems } });
                          }}
                        >
                          <PlusCircle className="mr-1 h-3 w-3" /> Add bullet
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add section trigger */}
        <Button variant="secondary" className="w-full text-xs h-9" onClick={() => setShowAddSection(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add custom section
        </Button>
      </div>

      {/* Preview Section */}
      <div className={cn("lg:sticky lg:top-20 lg:h-fit overflow-x-auto w-full pb-6", activeTab === "preview" ? "block" : "hidden lg:block")}>
        <div className="min-w-[760px] lg:min-w-0">
          <ResumePreview resume={current} />
        </div>
      </div>

      {/* ─── MODAL DIALOGS ────────────────────────────────────────────────── */}

      {/* Add Section Dialog */}
      {showAddSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-sm surface-panel select-none">
            <CardHeader className="pb-2 p-4 sm:p-5">
              <CardTitle className="text-sm">Create Custom Section</CardTitle>
              <CardDescription className="text-xs">Add a custom title and select a preset category structure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-5 pt-0">
              <div className="space-y-1.5">
                <Label htmlFor="secTitle" className="text-xs">Section title</Label>
                <Input id="secTitle" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} placeholder="Certifications / Awards" className="h-8.5 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="secType" className="text-xs">Section type structure</Label>
                <select
                  id="secType"
                  className="h-8.5 w-full rounded-md border border-input bg-background px-3.5 text-xs focus-ring"
                  value={newSectionType}
                  onChange={(e) => setNewSectionType(e.target.value)}
                >
                  <option value="EXPERIENCE">Experience / Project (Structured)</option>
                  <option value="EDUCATION">Education (Bullet List)</option>
                  <option value="SKILLS">Skills (Text area)</option>
                  <option value="CUSTOM">Custom Notes (Text area)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2 justify-end">
                <Button size="sm" variant="outline" className="h-8.5 text-xs" onClick={() => setShowAddSection(false)}>Cancel</Button>
                <Button size="sm" className="h-8.5 text-xs" onClick={createSection}>Create</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Career Node Dialog */}
      {showImportNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg surface-panel select-none">
            <CardHeader className="pb-2 p-4 sm:p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm">Import Career facts</CardTitle>
                <CardDescription className="text-xs">Select a universal library fact to populate this section.</CardDescription>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowImportNode(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0 max-h-96 overflow-y-auto space-y-3">
              {loadingNodes ? (
                <div className="flex justify-center py-6 text-xs text-muted-foreground"><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Loading Library...</div>
              ) : careerNodes.length === 0 ? (
                <p className="text-center py-6 text-xs text-muted-foreground">No career facts stored yet. Create some in the dashboard.</p>
              ) : (
                <div className="grid gap-2">
                  {careerNodes.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      className="p-3 border rounded-md text-left hover:border-primary transition focus-ring bg-card"
                      onClick={() => doImportNode(showImportNode, node)}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-xs text-foreground">{node.title}</h4>
                        <Badge variant="secondary" className="text-[9px]">{node.type.replaceAll("_", " ").toLowerCase()}</Badge>
                      </div>
                      {node.organization && <p className="text-[10px] text-muted-foreground mt-0.5">{node.organization}</p>}
                      {node.summary && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{node.summary}</p>}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Direct ATS Scan Dialog */}
      {showAtsScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-text">
          <Card className="w-full max-w-2xl surface-panel max-h-[85vh] overflow-y-auto">
            <CardHeader className="pb-2 p-4 sm:p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm">Direct ATS Score Scan</CardTitle>
                <CardDescription className="text-xs">Compare this active resume directly against a job description.</CardDescription>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setShowAtsScan(false); setAtsReport(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
              
              {!atsReport ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="scanTitle" className="text-xs">Job Title</Label>
                      <Input id="scanTitle" value={atsJobTitle} onChange={(e) => setAtsJobTitle(e.target.value)} placeholder="Senior Software Engineer" className="h-8 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="scanCompany" className="text-xs">Company Name</Label>
                      <Input id="scanCompany" value={atsCompany} onChange={(e) => setAtsCompany(e.target.value)} placeholder="Stripe" className="h-8 text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="scanDesc" className="text-xs">Job description (minimum 80 characters)</Label>
                    <Textarea id="scanDesc" value={atsJobDescription} onChange={(e) => setAtsJobDescription(e.target.value)} placeholder="Paste job description details here..." className="min-h-36 text-xs" />
                  </div>
                  <Button disabled={atsScanning} className="w-full h-8.5 text-xs" onClick={runAtsScan}>
                    {atsScanning ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
                    Generate Score
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">ATS Match Score</p>
                      <p className="text-2xl font-bold text-primary">{atsReport.score}%</p>
                    </div>
                    <div className="w-24">
                      <div className="h-2 rounded bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${atsReport.score}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 text-xs leading-relaxed max-h-72 overflow-y-auto">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Matched Keywords</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {atsReport.matchedKeywords.slice(0, 15).map((kw: string) => <Badge key={kw} variant="secondary" className="text-[10px]">{kw}</Badge>)}
                        {atsReport.matchedKeywords.length === 0 && <span className="text-muted-foreground italic text-[11px]">No keywords matched</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {atsReport.missingKeywords.slice(0, 15).map((kw: string) => <Badge key={kw} variant="outline" className="text-[10px] text-destructive border-destructive/30 bg-destructive/5">{kw}</Badge>)}
                        {atsReport.missingKeywords.length === 0 && <span className="text-muted-foreground italic text-[11px]">No keywords missing</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-0.5">Strengths</h4>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {atsReport.strengths.map((s: string) => <li key={s}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-0.5">Suggestions</h4>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {atsReport.suggestions.map((s: string) => <li key={s}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end border-t pt-3">
                    <Button size="sm" variant="outline" className="h-8.5 text-xs" onClick={() => setAtsReport(null)}>Scan Another</Button>
                    <Button size="sm" className="h-8.5 text-xs" onClick={() => { setShowAtsScan(false); setAtsReport(null); }}>Done</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  </div>
  );
}
