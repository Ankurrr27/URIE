"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Search, Star, Trash2, Edit3, Loader2, Save, X } from "lucide-react";
import type { CareerNode } from "@/types/career-node";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { parseBullets } from "@/features/career-nodes/node-payload";
import { careerNodeFormConfigs } from "@/features/career-nodes/node-form-config";

const colors = ["#0f8fa3", "#2563eb", "#16a34a", "#d97706", "#9333ea", "#dc2626", "#475569"];

export function NodeManager({ initialNodes }: { initialNodes: CareerNode[] }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  // Fact editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, Record<string, string>>>({});
  const [savingNodeId, setSavingNodeId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return nodes;
    return nodes.filter((node) => [node.title, node.type, node.organization, node.summary, ...node.tags, ...node.skills].filter(Boolean).some((value) => String(value).toLowerCase().includes(needle)));
  }, [nodes, query]);

  function getInitialFieldValues(node: CareerNode) {
    const content = typeof node.content === "string" ? JSON.parse(node.content) : (node.content || {});
    const config = careerNodeFormConfigs.find(c => c.type === node.type) || careerNodeFormConfigs[0];
    
    const values: Record<string, string> = {
      location: node.location || "",
      skills: Array.isArray(node.skills) ? node.skills.join(", ") : ""
    };

    for (const field of config.fields) {
      if (content[field.name] !== undefined) {
        if (Array.isArray(content[field.name])) {
          values[field.name] = (content[field.name] as string[]).join("\n");
        } else {
          values[field.name] = String(content[field.name]);
        }
      } else {
        // Fallback logic
        if (field.name === "bullets") {
          values[field.name] = node.summary || "";
        } else if (["projectName", "course", "platform", "achievement", "role", "certificateName", "skillName", "title"].includes(field.name)) {
          values[field.name] = node.title || "";
        } else if (["timeline", "college", "company", "organization", "issuer", "domain"].includes(field.name)) {
          values[field.name] = node.organization || "";
        } else {
          values[field.name] = "";
        }
      }
    }

    return values;
  }

  function startEdit(node: CareerNode) {
    setEditValues((current) => ({
      ...current,
      [node.id]: getInitialFieldValues(node)
    }));
    setEditingId(node.id);
  }

  async function saveNodeDetails(id: string) {
    const vals = editValues[id];
    if (!vals) {
      toast.error("No edits found.");
      return;
    }
    setSavingNodeId(id);
    try {
      const node = nodes.find(n => n.id === id);
      if (!node) throw new Error("Node not found.");

      const type = node.type;
      const getVal = (name: string) => (vals[name] ?? "").trim();

      let title = node.title;
      let organization = node.organization;
      let summary = node.summary;
      const originalContent = node.content 
        ? (typeof node.content === "string" ? JSON.parse(node.content) : node.content)
        : {};
      
      const newContent: Record<string, any> = { ...originalContent };

      // Fill newContent from config fields
      const config = careerNodeFormConfigs.find(c => c.type === type) || careerNodeFormConfigs[0];
      for (const field of config.fields) {
        if (field.name === "bullets") {
          const bullets = parseBullets(getVal("bullets"));
          newContent.bullets = bullets;
          summary = bullets.join("\n");
        } else {
          newContent[field.name] = getVal(field.name);
        }
      }

      // Sync to top-level DB fields based on type
      switch (type) {
        case "SKILL":
          title = getVal("skillName");
          organization = getVal("domain");
          summary = `${title}${organization ? ` in ${organization}` : ""}`;
          break;
        case "PROJECT":
          title = getVal("projectName");
          organization = getVal("timeline");
          break;
        case "EDUCATION":
          title = getVal("course");
          organization = getVal("college");
          summary = [organization, title, getVal("cgpa"), getVal("graduationDate")].filter(Boolean).join(" | ");
          break;
        case "CONTACT_INFO":
          title = getVal("email") || "Contact info";
          organization = getVal("location");
          summary = [getVal("email"), getVal("phone"), getVal("location"), getVal("portfolio")].filter(Boolean).join(" | ");
          break;
        case "SOCIAL_HANDLE":
        case "CODING_PROFILE":
          title = getVal("platform");
          organization = getVal("url");
          summary = [getVal("platform"), getVal("url"), getVal("stats")].filter(Boolean).join(" | ");
          break;
        case "RELEVANT_COURSEWORK":
          title = "Relevant Coursework";
          organization = null;
          summary = getVal("courses");
          newContent.courses = getVal("courses").split(",").map(c => c.trim()).filter(Boolean);
          break;
        case "ACHIEVEMENT":
          title = getVal("achievement");
          organization = getVal("metric");
          summary = [title, organization, getVal("context")].filter(Boolean).join(" - ");
          break;
        case "POSITION_OF_RESPONSIBILITY":
        case "EXPERIENCE":
          title = getVal("role");
          organization = getVal("organization") || getVal("company");
          break;
        case "CERTIFICATION":
          title = getVal("certificateName");
          organization = getVal("issuer");
          summary = [title, organization, getVal("credentialLink")].filter(Boolean).join(" | ");
          break;
        default:
          title = getVal("title") || title;
          summary = getVal("details") || summary;
          break;
      }

      // Validate required title field
      if (!title.trim()) {
        toast.error("Required title/name field cannot be empty.");
        setSavingNodeId(null);
        return;
      }

      const response = await fetch(`/api/career-nodes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          organization,
          location: getVal("location") || null,
          summary,
          skills: getVal("skills").split(",").map((s) => s.trim()).filter(Boolean),
          content: newContent
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Failed to save node");
      toast.success("Fact details updated successfully");
      
      setNodes((current) =>
        current.map((node) =>
          node.id === id
            ? {
                ...node,
                title,
                organization: organization || null,
                location: getVal("location") || null,
                summary: summary || null,
                skills: getVal("skills").split(",").map((s) => s.trim()).filter(Boolean),
                content: payload.data.content
              }
            : node
        )
      );
      setEditingId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save node");
    } finally {
      setSavingNodeId(null);
    }
  }

  function patchNode(id: string, patch: { color?: string; starred?: boolean }) {
    startTransition(async () => {
      const response = await fetch(`/api/career-nodes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error?.message ?? "Could not update node");
        return;
      }
      setNodes((current) => current.map((node) => (node.id === id ? { ...node, content: payload.data.content } : node)));
      toast.success("Node updated");
    });
  }

  function deleteNode(id: string) {
    startTransition(async () => {
      const response = await fetch(`/api/career-nodes/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json();
        toast.error(payload.error?.message ?? "Could not delete node");
        return;
      }
      setNodes((current) => current.filter((node) => node.id !== id));
      toast.success("Node deleted");
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search nodes by type, title, skill, tag..." />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((node) => {
          const color = node.content.color ?? "#0f8fa3";
          const starred = Boolean(node.content.starred);
          return (
            <Card key={node.id} className="overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-1.5" style={{ background: color }} />
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 justify-between">
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">{node.type.replaceAll("_", " ").toLowerCase()}</Badge>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant={starred ? "secondary" : "ghost"} className="h-7 w-7" onClick={() => patchNode(node.id, { starred: !starred })} aria-label={starred ? "Unstar node" : "Star node"}>
                            <Star className={`h-4 w-4 ${starred ? "fill-warning text-warning" : ""}`} />
                          </Button>
                          {editingId !== node.id ? (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" onClick={() => startEdit(node)} aria-label="Edit node details">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => setEditingId(null)} aria-label="Cancel edit">
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {editingId === node.id ? (
                        <div className="space-y-3 mt-3 text-xs leading-normal">
                          {(() => {
                            const config = careerNodeFormConfigs.find(c => c.type === node.type) || careerNodeFormConfigs[0];
                            return (
                              <>
                                {config.fields.map((field) => (
                                  <div key={field.name} className="grid gap-1">
                                    <Label className="text-[10px] text-muted-foreground font-semibold">
                                      {field.label} {field.required && <span className="text-destructive">*</span>}
                                    </Label>
                                    {field.kind === "textarea" ? (
                                      <Textarea
                                        className="min-h-16 text-xs focus-ring"
                                        value={editValues[node.id]?.[field.name] ?? ""}
                                        onChange={(e) => setEditValues(prev => ({
                                          ...prev,
                                          [node.id]: { ...prev[node.id], [field.name]: e.target.value }
                                        }))}
                                        placeholder={field.placeholder}
                                      />
                                    ) : (
                                      <Input
                                        className="h-8 text-xs focus-ring"
                                        value={editValues[node.id]?.[field.name] ?? ""}
                                        onChange={(e) => setEditValues(prev => ({
                                          ...prev,
                                          [node.id]: { ...prev[node.id], [field.name]: e.target.value }
                                        }))}
                                        placeholder={field.placeholder}
                                      />
                                    )}
                                  </div>
                                ))}
                                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-dashed mt-2">
                                  <div className="grid gap-1">
                                    <Label className="text-[10px] text-muted-foreground font-semibold">Location</Label>
                                    <Input
                                      className="h-8 text-xs focus-ring"
                                      value={editValues[node.id]?.location ?? ""}
                                      onChange={(e) => setEditValues(prev => ({ ...prev, [node.id]: { ...prev[node.id], location: e.target.value } }))}
                                      placeholder="City, Country"
                                    />
                                  </div>
                                  <div className="grid gap-1">
                                    <Label className="text-[10px] text-muted-foreground font-semibold">Skills (comma separated)</Label>
                                    <Input
                                      className="h-8 text-xs focus-ring"
                                      value={editValues[node.id]?.skills ?? ""}
                                      onChange={(e) => setEditValues(prev => ({ ...prev, [node.id]: { ...prev[node.id], skills: e.target.value } }))}
                                      placeholder="React, Node.js"
                                    />
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <>
                          <CardTitle className="mt-2 text-base">{node.title}</CardTitle>
                          {node.organization ? <p className="mt-1 text-xs text-muted-foreground font-medium">{node.organization}</p> : null}
                          {node.location ? <p className="text-[10px] text-muted-foreground">{node.location}</p> : null}
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-0">
                  {editingId !== node.id && (
                    <>
                      <NodeContentPreview node={node} />
                      {node.skills && node.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {node.skills.map(skill => <Badge key={skill} variant="outline" className="text-[9px]">{skill}</Badge>)}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {colors.map((item) => (
                          <button
                            key={item}
                            type="button"
                            className="h-6 w-6 rounded-full border ring-offset-background focus-ring"
                            style={{ background: item, outline: item === color ? "2px solid hsl(var(--foreground))" : undefined }}
                            onClick={() => patchNode(node.id, { color: item })}
                            aria-label={`Set node color ${item}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </div>
              
              <CardContent className="pt-0 pb-4">
                {editingId === node.id ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
                    <Button size="sm" className="flex-1 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => saveNodeDetails(node.id)} disabled={savingNodeId === node.id}>
                      {savingNodeId === node.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
                      Save Details
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between gap-2">
                    <Button size="sm" variant="outline" className="h-8 text-xs" disabled={pending} onClick={() => patchNode(node.id, { starred: !starred })}>{starred ? "Starred" : "Star"}</Button>
                    <Button size="sm" variant="destructive" className="h-8 text-xs" disabled={pending} onClick={() => deleteNode(node.id)}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
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
