"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Brain, Briefcase, Check, FilePlus2, Plus, Search } from "lucide-react";
import type { CareerNode, CareerNodeType } from "@/types/career-node";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const nodeTypes: CareerNodeType[] = [
  "SUMMARY",
  "EXPERIENCE",
  "PROJECT",
  "SKILL",
  "EDUCATION",
  "CERTIFICATION",
  "AWARD",
  "PUBLICATION",
  "VOLUNTEERING",
  "CUSTOM"
];

export function UniversalResumeWorkspace({ initialNodes }: { initialNodes: CareerNode[] }) {
  const router = useRouter();
  const [nodes, setNodes] = useState(initialNodes);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<CareerNodeType>("EXPERIENCE");
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

  async function createNode(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim();
    const organization = String(formData.get("organization") ?? "").trim();
    const skills = splitList(String(formData.get("skills") ?? ""));
    const tags = splitList(String(formData.get("tags") ?? ""));
    const keywords = splitList(String(formData.get("keywords") ?? ""));

    startTransition(async () => {
      try {
        if (title.length < 2) throw new Error("Node title must be at least 2 characters.");
        if (!summary) throw new Error("Reusable evidence is required.");
        const response = await fetch("/api/career-nodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            title,
            organization: organization || null,
            summary,
            content: { bullets: summary ? [summary] : [] },
            tags,
            skills,
            keywords,
            impactScore: estimateImpact(summary),
            evidenceLevel: /\d+%|\$\d+|\d+x|\d+\s+(users|customers|requests)/i.test(summary) ? 4 : 2,
            isCurrent: false,
            visibility: true
          })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(formatApiError(payload));
        setNodes((current) => [payload.data, ...current]);
        toast.success("Career node added to your universal resume");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not create node");
      }
    });
  }

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
    <div className="grid gap-6 xl:grid-cols-[420px_1fr_360px]">
      <Card>
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
              {nodeTypes.map((item) => (
                <Button key={item} type="button" variant={type === item ? "default" : "secondary"} size="sm" onClick={() => setType(item)}>
                  {item.toLowerCase()}
                </Button>
              ))}
            </div>
            <Field name="title" label="Node title" placeholder="Scaled payment reconciliation platform" />
            <Field name="organization" label="Company / context" placeholder="Acme Inc." />
            <div className="space-y-2">
              <Label htmlFor="summary">Reusable evidence</Label>
              <Textarea id="summary" name="summary" placeholder="Built a reconciliation workflow that reduced finance review time by 42%..." required />
            </div>
            <Field name="skills" label="Skills" placeholder="Next.js, PostgreSQL, leadership" />
            <Field name="keywords" label="ATS keywords" placeholder="full stack, observability, payments" />
            <Field name="tags" label="Tags" placeholder="backend, fintech, senior" />
            <Button disabled={pending} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add to universal resume
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Universal node library</CardTitle>
          <CardDescription>Select nodes to assemble a focused resume for a role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by skill, keyword, project, or company" />
          </div>
          <div className="grid gap-3">
            {filtered.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => toggleNode(node.id)}
                className="rounded-lg border bg-card p-4 text-left transition hover:border-primary"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{node.type.toLowerCase()}</Badge>
                      {node.organization ? <span className="text-xs text-muted-foreground">{node.organization}</span> : null}
                    </div>
                    <h3 className="mt-2 font-medium">{node.title}</h3>
                  </div>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md border ${selected.includes(node.id) ? "border-primary bg-primary text-primary-foreground" : ""}`}>
                    {selected.includes(node.id) ? <Check className="h-4 w-4" /> : null}
                  </span>
                </div>
                {node.summary ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{node.summary}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {[...node.skills, ...node.keywords].slice(0, 8).map((item) => <Badge key={item} variant="outline">{item}</Badge>)}
                </div>
              </button>
            ))}
            {!filtered.length ? <p className="rounded-md border p-4 text-sm text-muted-foreground">No nodes yet. Add your first career node to build the master library.</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Compose role resume
          </CardTitle>
          <CardDescription>Turn selected nodes into a focused resume draft.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={composeResume} className="space-y-4">
            <Field name="resumeTitle" label="Resume title" placeholder="Senior Full Stack Engineer Resume" />
            <Field name="targetRole" label="Target role" placeholder="Senior Full Stack Engineer" />
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
      <Input id={name} name={name} placeholder={placeholder} required={name === "title" || name === "resumeTitle"} />
    </div>
  );
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function estimateImpact(value: string) {
  let score = 35;
  if (/\d+%|\$\d+|\d+x/i.test(value)) score += 35;
  if (/led|owned|built|launched|improved|reduced|increased|automated/i.test(value)) score += 20;
  return Math.min(100, score);
}

function formatApiError(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "details" in payload.error
  ) {
    const details = payload.error.details as { fieldErrors?: Record<string, string[]> };
    const first = Object.entries(details.fieldErrors ?? {}).find(([, messages]) => messages.length);
    if (first) return `${first[0]}: ${first[1][0]}`;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error
  ) {
    return String(payload.error.message);
  }

  return "Request failed";
}
