"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bot, Copy, Loader2, Save, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function AssistantPage() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState<"bullets" | "summary" | "skills" | null>(null);
  const [savingNode, setSavingNode] = useState(false);

  async function runAi(action: "bullets" | "summary" | "skills") {
    if (!content.trim()) {
      toast.error("Please enter some text first.");
      return;
    }
    setLoading(action);
    setResult("");

    try {
      const response = await fetch(`/api/ai/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "AI request failed");
      setResult(payload.data.text);
      toast.success("AI suggestion generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI request failed");
    } finally {
      setLoading(null);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard");
  }

  async function saveAsNode() {
    setSavingNode(true);
    try {
      const typeMap = {
        bullets: "EXPERIENCE",
        summary: "SUMMARY",
        skills: "SKILL"
      };
      
      const response = await fetch("/api/career-nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CUSTOM",
          title: "AI Suggested Content",
          summary: result,
          content: { generatedFrom: content },
          tags: ["AI"],
          skills: [],
          keywords: [],
          impactScore: 50,
          evidenceLevel: 1,
          isCurrent: false,
          visibility: true
        })
      });
      
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Failed to save node");
      toast.success("Saved to Career Library as custom node");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save node");
    } finally {
      setSavingNode(false);
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <Badge variant="secondary" className="mb-2">AI Assistant</Badge>
        <h1 className="text-2xl font-semibold tracking-tight">Resume AI Assistant</h1>
        <p className="mt-1 text-xs text-muted-foreground">Use our AI suggestions to polish achievement bullets, generate summaries, and identify relevant keywords.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><Bot className="h-4 w-4 text-primary" /> Input text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              className="min-h-72 text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw resume bullets, summary draft, or a target job description here..."
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={() => runAi("bullets")} disabled={loading !== null}>
                {loading === "bullets" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
                Improve bullets
              </Button>
              <Button size="sm" variant="secondary" onClick={() => runAi("summary")} disabled={loading !== null}>
                {loading === "summary" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                Generate summary
              </Button>
              <Button size="sm" variant="secondary" onClick={() => runAi("skills")} disabled={loading !== null}>
                {loading === "skills" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                Suggest skills
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Optimized Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="min-h-72 rounded-md border bg-accent/10 p-3 text-sm font-normal leading-relaxed overflow-y-auto max-h-80 select-text whitespace-pre-wrap">
              {result || <span className="text-muted-foreground italic">Your AI-suggested improvements will appear here...</span>}
            </div>
            
            {result ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={saveAsNode} disabled={savingNode}>
                  {savingNode ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                  Save to library
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
