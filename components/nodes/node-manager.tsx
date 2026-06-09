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

const colors = ["#0f8fa3", "#2563eb", "#16a34a", "#d97706", "#9333ea", "#dc2626", "#475569"];

export function NodeManager({ initialNodes }: { initialNodes: CareerNode[] }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  // Fact editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { title: string; organization: string; location: string; summary: string; skills: string }>>({});
  const [savingNodeId, setSavingNodeId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return nodes;
    return nodes.filter((node) => [node.title, node.type, node.organization, node.summary, ...node.tags, ...node.skills].filter(Boolean).some((value) => String(value).toLowerCase().includes(needle)));
  }, [nodes, query]);

  function startEdit(node: CareerNode) {
    setEditValues((current) => ({
      ...current,
      [node.id]: {
        title: node.title || "",
        organization: node.organization || "",
        location: node.location || "",
        summary: node.summary || "",
        skills: Array.isArray(node.skills) ? node.skills.join(", ") : ""
      }
    }));
    setEditingId(node.id);
  }

  async function saveNodeDetails(id: string) {
    const vals = editValues[id];
    if (!vals || !vals.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setSavingNodeId(id);
    try {
      const response = await fetch(`/api/career-nodes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: vals.title,
          organization: vals.organization,
          location: vals.location,
          summary: vals.summary,
          skills: vals.skills.split(",").map((s) => s.trim()).filter(Boolean)
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
                title: vals.title,
                organization: vals.organization || null,
                location: vals.location || null,
                summary: vals.summary || null,
                skills: vals.skills.split(",").map((s) => s.trim()).filter(Boolean)
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
                          <div className="grid gap-1">
                            <Label className="text-[10px] text-muted-foreground font-semibold">Title</Label>
                            <Input
                              className="h-8 text-xs focus-ring"
                              value={editValues[node.id]?.title ?? ""}
                              onChange={(e) => setEditValues(prev => ({ ...prev, [node.id]: { ...prev[node.id], title: e.target.value } }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="grid gap-1">
                              <Label className="text-[10px] text-muted-foreground font-semibold">Org / Employer</Label>
                              <Input
                                className="h-8 text-xs focus-ring"
                                value={editValues[node.id]?.organization ?? ""}
                                onChange={(e) => setEditValues(prev => ({ ...prev, [node.id]: { ...prev[node.id], organization: e.target.value } }))}
                              />
                            </div>
                            <div className="grid gap-1">
                              <Label className="text-[10px] text-muted-foreground font-semibold">Location</Label>
                              <Input
                                className="h-8 text-xs focus-ring"
                                value={editValues[node.id]?.location ?? ""}
                                onChange={(e) => setEditValues(prev => ({ ...prev, [node.id]: { ...prev[node.id], location: e.target.value } }))}
                              />
                            </div>
                          </div>
                          <div className="grid gap-1">
                            <Label className="text-[10px] text-muted-foreground font-semibold">Details / Summary</Label>
                            <Textarea
                              className="min-h-16 text-xs focus-ring"
                              value={editValues[node.id]?.summary ?? ""}
                              onChange={(e) => setEditValues(prev => ({ ...prev, [node.id]: { ...prev[node.id], summary: e.target.value } }))}
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label className="text-[10px] text-muted-foreground font-semibold">Skills (comma separated)</Label>
                            <Input
                              className="h-8 text-xs focus-ring"
                              value={editValues[node.id]?.skills ?? ""}
                              onChange={(e) => setEditValues(prev => ({ ...prev, [node.id]: { ...prev[node.id], skills: e.target.value } }))}
                            />
                          </div>
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
                      <p className="line-clamp-3 text-sm text-muted-foreground whitespace-pre-wrap">{node.summary ?? "No summary"}</p>
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
