"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Briefcase, Check, FilePlus2, Search } from "lucide-react";
import type { CareerNode } from "@/types/career-node";
import { formatApiError } from "@/lib/client/api-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NodeToResume({ initialNodes }: { initialNodes: CareerNode[] }) {
  const router = useRouter();
  const [nodes] = useState(initialNodes);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return nodes;
    return nodes.filter((node) =>
      [node.title, node.organization, node.summary, ...node.tags, ...node.skills, ...node.keywords]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [nodes, query]);

  async function composeResume(formData: FormData) {
    const title = String(formData.get("resumeTitle") ?? "").trim();
    const targetRole = String(formData.get("targetRole") ?? "").trim();

    startTransition(async () => {
      try {
        const response = await fetch("/api/career-nodes?action=compose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, targetRole, nodeIds: selected })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(formatApiError(payload));
        toast.success("Role-specific resume created");
        router.push(`/dashboard/resumes/${payload.data.id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not compose resume");
      }
    });
  }

  function toggleNode(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="surface-panel">
        <CardHeader>
          <CardTitle>Choose nodes</CardTitle>
          <CardDescription>Select the strongest evidence for the role, then create a focused resume draft.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by skill, keyword, project, company..." />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {filtered.map((node) => {
              const active = selected.includes(node.id);
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => toggleNode(node.id)}
                  className="rounded-lg border bg-card p-4 text-left transition hover:border-primary focus-ring"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{node.type.replaceAll("_", " ").toLowerCase()}</Badge>
                        {node.organization ? <span className="text-xs text-muted-foreground">{node.organization}</span> : null}
                      </div>
                      <h3 className="mt-2 font-medium">{node.title}</h3>
                    </div>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md border ${active ? "border-primary bg-primary text-primary-foreground" : ""}`}>
                      {active ? <Check className="h-4 w-4" /> : null}
                    </span>
                  </div>
                  {node.summary ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{node.summary}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[...node.skills, ...node.keywords].slice(0, 8).map((item) => <Badge key={item} variant="outline">{item}</Badge>)}
                  </div>
                </button>
              );
            })}
            {!filtered.length ? <p className="rounded-md border p-4 text-sm text-muted-foreground">No matching nodes found.</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="surface-panel h-fit xl:sticky xl:top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Create resume
          </CardTitle>
          <CardDescription>Turn selected nodes into a targeted draft.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={composeResume} className="space-y-4">
            <Field name="resumeTitle" label="Resume title" placeholder="SDE Intern Resume" />
            <Field name="targetRole" label="Target role" placeholder="Software Engineer Intern" />
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              {selected.length} node{selected.length === 1 ? "" : "s"} selected
            </div>
            <Button disabled={pending || selected.length === 0} className="w-full">
              <FilePlus2 className="mr-2 h-4 w-4" />
              Create tailored resume
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} placeholder={placeholder} required />
    </div>
  );
}
