"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
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

  async function submit(formData: FormData) {
    setLoading(true);
    try {
      const response = await fetch("/api/ats/analyze", { method: "POST", body: formData });
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
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Analyze resume</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume">Resume PDF</Label>
              <Input id="resume" name="resume" type="file" accept="application/pdf" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input id="jobTitle" name="jobTitle" placeholder="Senior Full Stack Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job description</Label>
              <Textarea id="jobDescription" name="jobDescription" required minLength={80} className="min-h-64" />
            </div>
            <Button disabled={loading} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {loading ? "Analyzing..." : "Run ATS analysis"}
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
