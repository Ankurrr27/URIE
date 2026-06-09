"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileChartColumnIncreasing, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Result = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  suggestions: string[];
};

export function AtsAnalyzer() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState<{ id: string; title: string }[]>([]);
  const [mode, setMode] = useState<"upload" | "select">("upload");
  const [selectedResumeId, setSelectedResumeId] = useState("");

  useEffect(() => {
    async function loadResumes() {
      try {
        const response = await fetch("/api/resumes?pageSize=50");
        const payload = await response.json();
        if (response.ok && payload.data?.items) {
          setResumes(payload.data.items);
          if (payload.data.items.length) {
            setSelectedResumeId(payload.data.items[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load resumes", e);
      }
    }
    void loadResumes();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      let response;
      if (mode === "upload") {
        response = await fetch("/api/ats/analyze", { method: "POST", body: formData });
      } else {
        const payload = {
          resumeId: selectedResumeId,
          jobDescription: formData.get("jobDescription"),
          jobTitle: formData.get("jobTitle"),
          company: formData.get("company")
        };
        response = await fetch("/api/ats/analyze-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Analysis failed");
      setResult(payload.data);
      toast.success("ATS analysis complete");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Analyze resume</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div className="flex gap-2 rounded-md bg-accent/25 p-1 text-xs">
              <button
                type="button"
                className={`flex-1 rounded-sm py-1.5 font-medium transition ${mode === "upload" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
                onClick={() => setMode("upload")}
              >
                Upload PDF
              </button>
              <button
                type="button"
                className={`flex-1 rounded-sm py-1.5 font-medium transition ${mode === "select" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
                onClick={() => setMode("select")}
                disabled={resumes.length === 0}
              >
                Select Saved ({resumes.length})
              </button>
            </div>

            {mode === "upload" ? (
              <div className="space-y-1.5">
                <Label htmlFor="resume" className="text-xs">Resume PDF</Label>
                <Input id="resume" name="resume" type="file" accept="application/pdf" required className="h-8.5 text-xs" />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="resumeSelect" className="text-xs">Choose saved resume</Label>
                <select
                  id="resumeSelect"
                  className="h-8.5 w-full rounded-md border border-input bg-background px-2.5 text-xs focus-ring"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="jobTitle" className="text-xs">Job title</Label>
              <Input id="jobTitle" name="jobTitle" placeholder="Senior Full Stack Engineer" className="h-8.5 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company" className="text-xs">Company</Label>
              <Input id="company" name="company" placeholder="Stripe" className="h-8.5 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jobDescription" className="text-xs">Job description</Label>
              <Textarea id="jobDescription" name="jobDescription" required minLength={80} className="min-h-40 text-xs" placeholder="Paste target description (min 80 chars)..." />
            </div>
            <Button disabled={loading} className="w-full h-8.5 text-xs">
              {loading ? (
                "Analyzing..."
              ) : (
                <>
                  <FileChartColumnIncreasing className="mr-1.5 h-3.5 w-3.5" />
                  Run ATS analysis
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Score report</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ATS score</span>
                  <span className="text-2xl font-semibold">{result.score}%</span>
                </div>
                <Progress value={result.score} />
              </div>
              <KeywordBlock title="Matched keywords" items={result.matchedKeywords} />
              <KeywordBlock title="Missing keywords" items={result.missingKeywords} muted />
              <ListBlock title="Strengths" items={result.strengths} />
              <ListBlock title="Suggestions" items={result.suggestions} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Upload a PDF and job description to generate a report.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KeywordBlock({ title, items, muted }: { title: string; items: string[]; muted?: boolean }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 24).map((item) => <Badge key={item} variant={muted ? "secondary" : "default"}>{item}</Badge>)}
      </div>
    </section>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
