"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Upload, FileText, CheckCircle, Brain, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import type { CareerNode } from "@/types/career-node";

type ProgressStep = "uploading" | "parsing" | "ai" | "saving" | "done" | null;

export default function ExtractNodesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<ProgressStep>(null);
  const [extractedNodes, setExtractedNodes] = useState<CareerNode[]>([]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        toast.error("Only PDF files are supported.");
        return;
      }
      setFile(selected);
    }
  }

  async function startExtraction() {
    if (!file) return;
    setLoading(true);
    setExtractedNodes([]);
    
    // Simulate steps for UI smoothness
    setStep("uploading");
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      setTimeout(() => {
        if (loading) setStep("parsing");
      }, 800);
      
      setTimeout(() => {
        if (loading) setStep("ai");
      }, 1600);

      const response = await fetch("/api/career-nodes/extract", {
        method: "POST",
        body: formData
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Extraction failed");
      
      setStep("saving");
      setTimeout(() => {
        setExtractedNodes(payload.data);
        setStep("done");
        toast.success(`Successfully extracted ${payload.data.length} career facts!`);
        setLoading(false);
      }, 600);
      
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to extract facts.");
      setStep(null);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
          <Link href="/dashboard/universal">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Add facts
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Auto-extract facts</h1>
        <p className="text-xs text-muted-foreground">
          Upload an existing resume PDF. URIE will automatically extract and parse your work experience, projects, education, and skills.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Upload Card */}
        {step !== "done" && (
          <Card className="border-0 sm:border bg-transparent sm:bg-card/90 shadow-none sm:shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><Brain className="h-4 w-4 text-primary" /> Resume PDF Reader</CardTitle>
              <CardDescription className="text-xs">Select your resume PDF to decompose it into reusable nodes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/10 hover:bg-muted/15 transition cursor-pointer relative group">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={loading}
                />
                <Upload className="h-8 w-8 text-muted-foreground mb-2 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-foreground">
                  {file ? file.name : "Drag & drop resume PDF or click to select"}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">PDF format only (Max 5MB)</span>
              </div>

              {file && !loading && (
                <Button className="w-full text-xs h-8.5" onClick={startExtraction}>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Start Auto-Extraction
                </Button>
              )}

              {loading && (
                <div className="space-y-3 pt-2 text-center text-xs">
                  <div className="flex items-center justify-center gap-2 font-semibold">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    {step === "uploading" && "Uploading resume file..."}
                    {step === "parsing" && "Extracting text content..."}
                    {step === "ai" && "Decomposing achievements with AI..."}
                    {step === "saving" && "Saving extracted facts..."}
                  </div>
                  <div className="w-full bg-muted h-1 rounded overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-500" 
                      style={{ 
                        width: 
                          step === "uploading" ? "25%" : 
                          step === "parsing" ? "50%" : 
                          step === "ai" ? "75%" : "95%" 
                      }} 
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results Card */}
        {step === "done" && (
          <Card className="border-0 sm:border bg-transparent sm:bg-card/90 shadow-none sm:shadow-sm">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-success"><CheckCircle className="h-4.5 w-4.5" /> Extraction Completed</CardTitle>
                <CardDescription className="text-xs">URIE parsed the PDF and created the following career library nodes.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="h-7.5 text-xs" onClick={() => { setFile(null); setStep(null); }}>
                Extract another
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {extractedNodes.map((node) => (
                  <div key={node.id} className="p-4 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{node.title}</h4>
                        {node.organization && <p className="text-muted-foreground text-xs">{node.organization}</p>}
                      </div>
                      <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-semibold">
                        {node.type.replaceAll("_", " ").toLowerCase()}
                      </Badge>
                    </div>
                    {node.summary && <p className="text-muted-foreground text-[11px] leading-relaxed whitespace-pre-wrap">{node.summary}</p>}
                    {node.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {node.skills.map(s => <Badge key={s} variant="outline" className="text-[8px]">{s}</Badge>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-4 border-t bg-muted/5 flex justify-end gap-2">
                <Button asChild size="sm" variant="secondary" className="h-8 text-xs">
                  <Link href="/dashboard/nodes">Go to Node Manager</Link>
                </Button>
                <Button asChild size="sm" className="h-8 text-xs">
                  <Link href="/dashboard/universal">View Library</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
