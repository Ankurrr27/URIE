"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Search, Star, Trash2 } from "lucide-react";
import type { CareerNode } from "@/types/career-node";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const colors = ["#0f8fa3", "#2563eb", "#16a34a", "#d97706", "#9333ea", "#dc2626", "#475569"];

export function NodeManager({ initialNodes }: { initialNodes: CareerNode[] }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return nodes;
    return nodes.filter((node) => [node.title, node.type, node.organization, node.summary, ...node.tags, ...node.skills].filter(Boolean).some((value) => String(value).toLowerCase().includes(needle)));
  }, [nodes, query]);

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
            <Card key={node.id} className="overflow-hidden">
              <div className="h-1.5" style={{ background: color }} />
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary">{node.type.replaceAll("_", " ").toLowerCase()}</Badge>
                    <CardTitle className="mt-2 text-base">{node.title}</CardTitle>
                    {node.organization ? <p className="mt-1 text-xs text-muted-foreground">{node.organization}</p> : null}
                  </div>
                  <Button size="icon" variant={starred ? "secondary" : "ghost"} onClick={() => patchNode(node.id, { starred: !starred })} aria-label={starred ? "Unstar node" : "Star node"}>
                    <Star className={`h-4 w-4 ${starred ? "fill-warning text-warning" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="line-clamp-3 text-sm text-muted-foreground">{node.summary ?? "No summary"}</p>
                <div className="flex flex-wrap gap-2">
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
                <div className="flex justify-between gap-2">
                  <Button size="sm" variant="outline" disabled={pending} onClick={() => patchNode(node.id, { starred: !starred })}>{starred ? "Starred" : "Star"}</Button>
                  <Button size="sm" variant="destructive" disabled={pending} onClick={() => deleteNode(node.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
