"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Download,
  Expand,
  FileCode2,
  Minimize2,
  PanelRight,
  Play,
  RefreshCw,
  Save,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonacoLatexEditor } from "@/components/latex/monaco-latex-editor";
import { cn } from "@/lib/utils";

const templates = {
  "Software Engineer": String.raw`\documentclass[10pt]{article}
\usepackage[margin=0.7in]{geometry}
\usepackage{enumitem}
\begin{document}
\begin{center}
{\LARGE Alex Morgan}\\
alex@example.com | github.com/alex | linkedin.com/in/alex
\end{center}
\section*{Summary}
Full-stack engineer focused on reliable systems, product velocity, and measurable business outcomes.
\section*{Experience}
\textbf{Senior Software Engineer} \hfill 2022--Present
\begin{itemize}[leftmargin=*]
\item Improved API latency by 38\% by redesigning caching and database access patterns.
\item Led migration to Kubernetes for services handling 2M monthly requests.
\end{itemize}
\section*{Skills}
Next.js, TypeScript, MongoDB, Prisma, Kubernetes, observability
\end{document}`
};

const snippets = [
  { label: "Section", value: "\\section*{New Section}\n" },
  { label: "Bullet", value: "\\begin{itemize}\n\\item Improved X by Y\\% through Z.\n\\end{itemize}\n" },
  { label: "Role", value: "\\textbf{Job Title} \\hfill 2024--Present\n" }
];

export function LatexWorkspace() {
  const [source, setSource] = useState(templates["Software Engineer"]);
  const [pdf, setPdf] = useState<string | null>(null);
  const [log, setLog] = useState("Live preview is shown until PDF compilation is enabled.");
  const [fullscreen, setFullscreen] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [compiling, setCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState("Initializing compiler engine...");
  const preview = useMemo(() => parseLatexPreview(source), [source]);
  const errors = useMemo(() => lintLatex(source), [source]);

  useEffect(() => {
    const saved = window.localStorage.getItem("resubee-latex-source");
    if (saved) setSource(saved);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem("resubee-latex-source", source);
      setSavedAt(new Date().toLocaleTimeString());
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [source]);

  useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreen(false);
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") void compile();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreen, source]);

  async function compile() {
    setCompiling(true);
    setCompilationProgress("pdflatex --interaction=nonstopmode document.tex");
    
    const steps = [
      "Running TeX engine passes...",
      "Resolving packages and document styles...",
      "Loading fonts (Computer Modern Roman)...",
      "Typesetting resume document structure...",
      "Generating PDF stream output..."
    ];
    
    let stepIdx = 0;
    const interval = window.setInterval(() => {
      if (stepIdx < steps.length) {
        setCompilationProgress(steps[stepIdx]);
        stepIdx++;
      }
    }, 400);

    try {
      const response = await fetch("/api/latex/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, engine: "pdflatex" })
      });
      const payload = await response.json();
      window.clearInterval(interval);
      if (!response.ok) {
        toast.error(payload.error?.message ?? "Compilation failed");
        setLog(payload.error?.message ?? "Compilation failed");
        return;
      }
      setPdf(payload.data.pdfBase64 ? `data:application/pdf;base64,${payload.data.pdfBase64}` : null);
      setLog(payload.data.log);
      toast[payload.data.pdfBase64 ? "success" : "info"](payload.data.pdfBase64 ? "PDF compiled successfully" : "Compiler disabled, showing live preview");
    } catch (err) {
      window.clearInterval(interval);
      toast.error("Compilation network request failed");
    } finally {
      setCompiling(false);
    }
  }

  function downloadPdf() {
    if (!pdf) return toast.info("Compile a PDF first. Live preview is currently active.");
    const link = document.createElement("a");
    link.href = pdf;
    link.download = "resubee-resume.pdf";
    link.click();
  }

  function insertSnippet(value: string) {
    setSource((current) => `${current.trim()}\n\n${value}`);
  }

  const editorHeight = fullscreen ? "calc(100vh - 184px)" : "640px";
  const previewHeight = fullscreen ? "calc(100vh - 184px)" : "640px";

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 flex flex-col overflow-hidden bg-background" : ""}>
      <div className={fullscreen ? "sticky top-0 z-10 border-b bg-background/95 p-3 backdrop-blur-xl" : "mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"}>
        {fullscreen ? (
          <div>
            <h1 className="text-xl font-semibold tracking-tight">LaTeX Resume Editor</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Edit LaTeX resumes with Monaco editor, standard snippets, and live PDF compilation.</p>
          </div>
        ) : (
          <div className="hidden sm:block" />
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="h-8 flex items-center bg-muted/60 text-muted-foreground border"><Save className="mr-1 h-3 w-3" /> Autosaved {savedAt ?? "soon"}</Badge>
          <Button asChild size="sm" variant="outline" className="h-8 text-xs">
            <Link href="/dashboard/nodes">
              <Plus className="mr-1.5 h-3.5 w-3.5 text-primary" /> Add More Nodes
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={compile}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh Preview
          </Button>
          <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90" onClick={downloadPdf}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
          </Button>
          <Button size="sm" variant="outline" className="h-8 hidden md:flex" onClick={() => setFullscreen((value) => !value)}>
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile/Tablet Tab Selector */}
      <div className="flex xl:hidden border-b border-border/80 mb-4 bg-muted/30 p-1 rounded-lg">
        <button
          className={cn(
            "flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all",
            activeTab === "edit" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab("edit")}
        >
          LaTeX Source
        </button>
        <button
          className={cn(
            "flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all",
            activeTab === "preview" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab("preview")}
        >
          Live Preview
        </button>
      </div>

      <div className={fullscreen ? "grid min-h-0 flex-1 gap-3 p-3 xl:grid-cols-2" : "grid gap-6 xl:grid-cols-2"}>
        {/* Left Panel: LaTeX Source Card */}
        <Card className={cn(fullscreen ? "flex min-h-0 flex-col overflow-hidden" : "", activeTab === "edit" ? "block" : "hidden xl:block")}>
          <CardHeader className={fullscreen ? "shrink-0 space-y-3 border-b bg-card/70 p-3" : "space-y-4"}>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2"><FileCode2 className="h-5 w-5 text-primary" /> LaTeX Source Code</CardTitle>
              <div className="flex flex-wrap gap-1.5">
                {snippets.map((snippet) => (
                  <Button key={snippet.label} size="sm" variant="outline" className="h-7 text-[10px] px-2 py-0" onClick={() => insertSnippet(snippet.value)}>
                    {snippet.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className={fullscreen ? "min-h-0 flex-1 space-y-3 p-3" : "space-y-3"}>
            {errors.length ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                {errors.map((error) => <p key={error}>{error}</p>)}
              </div>
            ) : null}
            <div className="min-h-0 overflow-hidden rounded-md border">
              <MonacoLatexEditor
                height={editorHeight}
                value={source}
                onChange={setSource}
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Panel: Live Preview Card */}
        <Card className={cn(fullscreen ? "flex min-h-0 flex-col overflow-hidden" : "", activeTab === "preview" ? "block" : "hidden xl:block", "relative")}>
          <CardHeader className={fullscreen ? "shrink-0 border-b bg-card/70 p-3" : ""}><CardTitle className="flex items-center gap-2"><PanelRight className="h-5 w-5 text-primary" /> Live preview</CardTitle></CardHeader>
          <CardContent className={cn(fullscreen ? "min-h-0 flex-1 p-3" : "p-0", "relative")}>
            {compiling ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 text-sm text-zinc-200 z-20 backdrop-blur-xs p-6 font-mono rounded-lg" style={{ height: previewHeight }}>
                <div className="relative mb-6 flex items-center justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                  <FileCode2 className="absolute h-6 w-6 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2 max-w-sm">
                  <p className="text-xs text-primary font-bold uppercase tracking-widest animate-pulse">Compiling Document</p>
                  <p className="text-xs font-semibold text-zinc-100">{compilationProgress}</p>
                  <div className="h-1.5 w-48 bg-zinc-800 rounded-full overflow-hidden mx-auto relative">
                    <div className="h-full bg-primary animate-infinite-progress w-24 absolute rounded-full" />
                  </div>
                  <div className="w-full max-w-xs rounded border border-zinc-800 bg-zinc-900/60 p-3 text-[10px] text-zinc-400 text-left font-mono h-24 overflow-y-auto mt-4 scrollbar-thin">
                    <p className="text-zinc-500">pdflatex --interaction=nonstopmode main.tex</p>
                    <p className="text-zinc-600">This is pdfTeX, Version 3.141592653-2.6-1.40.24 (TeX Live 2022)</p>
                    <p className="text-zinc-600">restricted \write18 enabled.</p>
                    <p className="text-primary mt-1">&gt; {compilationProgress}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {pdf ? (
              <iframe title="Compiled PDF" src={pdf} className="w-full rounded-md border bg-white" style={{ height: previewHeight }} />
            ) : (
              <Preview preview={preview} log={log} height={previewHeight} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Preview({ preview, log, height = "640px" }: { preview: ReturnType<typeof parseLatexPreview>; log: string; height?: string }) {
  return (
    <div className="overflow-auto rounded-md border bg-zinc-100 p-2.5 text-zinc-950 sm:p-4" style={{ height }}>
      <div className="mx-auto min-h-full max-w-[720px] min-w-[640px] xl:min-w-0 bg-white p-5 sm:p-10 shadow-sm rounded-xs">
        <header className="border-b pb-4 text-center">
          <h2 className="text-3xl font-bold">{preview.name || "Your Name"}</h2>
          {preview.contact ? <p className="mt-1 text-sm text-zinc-600">{preview.contact}</p> : null}
        </header>
        <div className="mt-6 space-y-5">
          {preview.sections.map((section) => (
            <section key={section.title}>
              <h3 className="border-b text-sm font-bold uppercase tracking-wide text-zinc-700">{section.title}</h3>
              {section.items.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">{section.items.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-2 text-sm leading-6">{section.body}</p>}
            </section>
          ))}
        </div>
        <p className="mt-8 border-t pt-3 text-xs text-zinc-500">{log}</p>
      </div>
    </div>
  );
}

function parseLatexPreview(source: string) {
  const document = source.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/)?.[1] ?? source;
  const center = document.match(/\\begin\{center\}([\s\S]*?)\\end\{center\}/)?.[1] ?? "";
  const centerLines = cleanLatex(center).split(/\n|\\\\/).map((line) => line.trim()).filter(Boolean);
  const sections = [...document.matchAll(/\\section\*\{([^}]+)\}([\s\S]*?)(?=\\section\*\{|\\end\{document\}|$)/g)].map((match) => {
    const body = match[2].trim();
    const items = [...body.matchAll(/\\item\s+(.+)/g)].map((item) => cleanLatex(item[1]));
    return { title: cleanLatex(match[1]), body: cleanLatex(body.replace(/\\begin\{itemize\}(?:\[[^\]]+\])?|\\end\{itemize\}|\\item\s+/g, "\n")).trim(), items };
  });
  return { name: centerLines[0]?.replace(/^LARGE\s+/, "") ?? "", contact: centerLines.slice(1).join(" | "), sections: sections.length ? sections : [{ title: "Preview", body: cleanLatex(document), items: [] }] };
}

function cleanLatex(value: string) {
  return value
    .replace(/\\textbf\{([^}]+)\}/g, "$1")
    .replace(/\{\\LARGE\s+([^}]+)\}/g, "$1")
    .replace(/\\hfill/g, " ")
    .replace(/\\%/g, "%")
    .replace(/\\\$/g, "$")
    .replace(/\\\\/g, "\n")
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]+\])?(?:\{([^}]*)\})?/g, "$1")
    .replace(/[{}]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function lintLatex(source: string) {
  const errors: string[] = [];
  const beginItemize = (source.match(/\\begin\{itemize\}/g) ?? []).length;
  const endItemize = (source.match(/\\end\{itemize\}/g) ?? []).length;
  if (!source.includes("\\begin{document}")) errors.push("Missing \\begin{document}.");
  if (!source.includes("\\end{document}")) errors.push("Missing \\end{document}.");
  if (beginItemize !== endItemize) errors.push("Unbalanced itemize environment.");
  return errors;
}
