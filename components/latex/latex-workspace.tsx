"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Download,
  Expand,
  FileCode2,
  Minimize2,
  PanelRight,
  RefreshCw,
  Save,
  Wand2,
  Plus
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonacoLatexEditor, type MonacoLatexEditorHandle } from "@/components/latex/monaco-latex-editor";
import { cn } from "@/lib/utils";

const templates = {
  "Software Engineer": String.raw`\documentclass[10pt]{article}
\usepackage[margin=0.65in]{geometry}
\usepackage{enumitem}
\begin{document}
\begin{center}
{\LARGE \textbf{Alex Morgan}}\\
\small alex@example.com | +1-800-555-0100 | github.com/alex | linkedin.com/in/alex | San Francisco, CA
\end{center}
\section*{Summary}
Full-stack engineer focused on reliable systems, product velocity, and measurable business outcomes.
\section*{Experience}
\textbf{Senior Software Engineer} \hfill 2022--Present
\begin{itemize}[leftmargin=*,itemsep=0pt,topsep=2pt]
\item Improved API latency by 38\% by redesigning caching and database access patterns.
\item Led migration to Kubernetes for services handling 2M monthly requests.
\end{itemize}
\section*{Projects}
\textbf{Portfolio Dashboard} \hfill github.com/alex/dashboard
\begin{itemize}[leftmargin=*,itemsep=0pt,topsep=2pt]
\item Built real-time analytics dashboard with Next.js, TypeScript, and Prisma ORM.
\end{itemize}
\section*{Education}
\textbf{B.Tech, Computer Science} \hfill 2018--2022\\
University of California, Berkeley | GPA: 3.8/4.0
\section*{Skills}
\textbf{Languages:} TypeScript, JavaScript, Python, SQL\\
\textbf{Frameworks:} Next.js, React, Node.js, FastAPI\\
\textbf{Tools:} Docker, Kubernetes, Prisma, PostgreSQL, Redis
\end{document}`,

  "AI/ML Engineer": String.raw`\documentclass[10pt]{article}
\usepackage[margin=0.65in]{geometry}
\usepackage{enumitem}
\begin{document}
\begin{center}
{\LARGE \textbf{Priya Sharma}}\\
\small priya@aimail.com | +1-800-555-0200 | github.com/priya-ml | linkedin.com/in/priya | Bengaluru, India
\end{center}
\section*{Summary}
ML Engineer with 3+ years building production-grade NLP and computer vision pipelines. Experienced in model training, RLHF fine-tuning, and scalable ML infrastructure on GCP and AWS.
\section*{Experience}
\textbf{ML Engineer -- NLP Platform} \hfill Jan 2023--Present
\begin{itemize}[leftmargin=*,itemsep=0pt,topsep=2pt]
\item Fine-tuned LLaMA-3 with RLHF, improving user preference score by 22\% on internal benchmark.
\item Reduced inference latency by 41\% using TensorRT quantization and vLLM batching.
\item Deployed transformer models serving 500K daily requests on GKE with 99.95\% uptime.
\end{itemize}
\textbf{ML Research Intern -- Computer Vision} \hfill May 2022--Dec 2022
\begin{itemize}[leftmargin=*,itemsep=0pt,topsep=2pt]
\item Implemented YOLOv8-based object detection pipeline achieving 93.4 mAP on custom dataset.
\item Reduced training time by 35\% via mixed-precision and gradient checkpointing techniques.
\end{itemize}
\section*{Projects}
\textbf{RAG-Based Document QA System} \hfill github.com/priya-ml/rag-qa
\begin{itemize}[leftmargin=*,itemsep=0pt,topsep=2pt]
\item Built end-to-end RAG pipeline with LangChain, FAISS, and GPT-4o for enterprise document search.
\end{itemize}
\section*{Education}
\textbf{M.Tech, Artificial Intelligence} \hfill 2020--2022\\
IIT Bombay | GPA: 9.1/10
\section*{Skills}
\textbf{ML/DL:} PyTorch, TensorFlow, Hugging Face, LangChain, scikit-learn, OpenCV\\
\textbf{LLMs:} GPT-4, LLaMA, Mistral, RLHF, RAG, Prompt Engineering, vLLM\\
\textbf{MLOps:} MLflow, Weights \& Biases, Kubeflow, Docker, GKE, AWS SageMaker\\
\textbf{Languages:} Python, SQL, C++, Bash
\end{document}`,

  "Management Role": String.raw`\documentclass[10pt]{article}
\usepackage[margin=0.65in]{geometry}
\usepackage{enumitem}
\begin{document}
\begin{center}
{\LARGE \textbf{Jordan Lee}}\\
\small jordan@corp.com | +1-800-555-0300 | linkedin.com/in/jordan | New York, NY
\end{center}
\section*{Summary}
Strategic product and operations leader with 8+ years driving cross-functional teams, P\&L ownership, and organizational growth at Series B to Fortune 500 companies.
\section*{Experience}
\textbf{Director of Product Management} \hfill Jan 2022--Present\\
FinEdge Corp, New York
\begin{itemize}[leftmargin=*,itemsep=0pt,topsep=2pt]
\item Led 3 product squads (22 engineers, 4 designers) to deliver \$4.2M ARR growth in 18 months.
\item Defined OKR framework adopted across 6 business units, improving on-time delivery by 30\%.
\item Spearheaded go-to-market for flagship B2B SaaS product, acquiring 120+ enterprise accounts.
\end{itemize}
\textbf{Senior Product Manager} \hfill Mar 2019--Dec 2021\\
GrowthBase Inc, San Francisco
\begin{itemize}[leftmargin=*,itemsep=0pt,topsep=2pt]
\item Launched self-serve onboarding flow reducing time-to-value from 14 days to 3 days.
\item Managed backlog of 200+ features using data-driven prioritization (RICE, JTBD frameworks).
\item Coordinated with Sales, Legal, and Engineering to close 5 enterprise deals worth \$2.1M.
\end{itemize}
\section*{Education}
\textbf{MBA, Strategy \& Finance} \hfill 2017--2019\\
Wharton School, University of Pennsylvania
\section*{Key Achievements}
\begin{itemize}[leftmargin=*,itemsep=0pt,topsep=2pt]
\item Grew team headcount from 8 to 35 over 2 years through structured hiring and onboarding.
\item Recognized as Top Performer Q3 2023 for driving 140\% of quarterly revenue target.
\end{itemize}
\section*{Skills}
\textbf{Leadership:} Team Building, OKR/KPI Frameworks, Stakeholder Management, P\&L Ownership\\
\textbf{Product:} Roadmapping, A/B Testing, User Research, JIRA, Figma, Amplitude\\
\textbf{Business:} Go-to-Market Strategy, Enterprise Sales Enablement, Financial Modeling
\end{document}`
};

const snippets = [
  { label: "Section", value: "\\section*{New Section}\n" },
  { label: "Bullet", value: "\\begin{itemize}\n\\item Improved X by Y\\% through Z.\n\\end{itemize}\n" },
  { label: "Role", value: "\\textbf{Job Title} \\hfill 2024--Present\n" }
];

export function LatexWorkspace() {
  const [source, setSource] = useState(templates["Software Engineer"]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("Software Engineer");
  const [pdf, setPdf] = useState<string | null>(null);
  const [log, setLog] = useState("Live preview is shown until PDF compilation is enabled.");
  const [fullscreen, setFullscreen] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [compiling, setCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState("Initializing compiler engine...");
  const { resolvedTheme } = useTheme();
  const monacoTheme = resolvedTheme === "dark" ? "vs-dark" : "vs";
  const editorRef = useRef<MonacoLatexEditorHandle>(null);
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

  const editorHeight = fullscreen ? "calc(100vh - 130px)" : "780px";
  const previewHeight = fullscreen ? "calc(100vh - 130px)" : "780px";

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 flex flex-col overflow-hidden bg-background" : ""}>
      {/* Unified single-row toolbar — title left, controls right */}
      <div className={fullscreen ? "sticky top-0 z-10 border-b bg-background/95 px-3 py-2 backdrop-blur-xl flex items-center gap-1.5" : "mb-3 flex flex-wrap items-center gap-1.5"}>
        {/* Page title (non-fullscreen only) */}
        {!fullscreen && (
          <h1 className="text-base font-semibold tracking-tight shrink-0 mr-1">LaTeX Resume Editor</h1>
        )}
        {fullscreen && (
          <span className="text-sm font-semibold shrink-0 mr-1">LaTeX Resume Editor</span>
        )}
        {/* Template selector */}
        <select
          className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-ring shrink-0"
          value={selectedTemplate}
          onChange={(e) => {
            const key = e.target.value as keyof typeof templates;
            if (key && templates[key]) {
              setSource(templates[key]);
              setSelectedTemplate(key);
              setPdf(null);
            }
          }}
          title="Load a template"
        >
          {Object.keys(templates).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        {/* Snippets */}
        {snippets.map((snippet) => (
          <Button key={snippet.label} size="sm" variant="outline" className="h-8 text-[10px] px-2" onClick={() => insertSnippet(snippet.value)}>
            {snippet.label}
          </Button>
        ))}
        {/* Format button */}
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-[10px] px-2 text-violet-500 border-violet-400/50 hover:bg-violet-50 dark:hover:bg-violet-950/30"
          onClick={() => { editorRef.current?.formatLatex(); toast.success("LaTeX formatted!"); }}
          title="Auto-format LaTeX (indentation + blank lines)"
        >
          <Wand2 className="mr-1 h-3 w-3" /> Format
        </Button>
        <div className="flex-1" />
        {/* Action buttons */}
        <Badge variant="secondary" className="h-8 flex items-center bg-muted/60 text-muted-foreground border text-[10px]"><Save className="mr-1 h-3 w-3" /> {savedAt ?? "soon"}</Badge>
        <Button asChild size="sm" variant="outline" className="h-8 text-xs">
          <Link href="/dashboard/nodes">
            <Plus className="mr-1 h-3.5 w-3.5 text-primary" /> Nodes
          </Link>
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={compile}>
          <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
        </Button>
        <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90" onClick={downloadPdf}>
          <Download className="mr-1 h-3.5 w-3.5" /> PDF
        </Button>
        <Button size="sm" variant="outline" className="h-8 hidden md:flex" onClick={() => setFullscreen((value) => !value)}>
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
        </Button>
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

      <div className={fullscreen ? "grid min-h-0 flex-1 gap-3 p-3 xl:grid-cols-2" : "grid gap-4 xl:grid-cols-[3fr_2fr]"}>
        {/* Left Panel: LaTeX Source Card */}
        <Card className={cn(fullscreen ? "flex min-h-0 flex-col overflow-hidden" : "", activeTab === "edit" ? "block" : "hidden xl:block")}>
          <CardHeader className={fullscreen ? "shrink-0 border-b bg-card/70 p-2.5" : "p-3 border-b"}>
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-primary shrink-0" />
              <CardTitle className="text-sm">LaTeX Source Code</CardTitle>
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
                ref={editorRef}
                height={editorHeight}
                value={source}
                onChange={setSource}
                monacoTheme={monacoTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Panel: Live Preview Card */}
        <Card className={cn(fullscreen ? "flex min-h-0 flex-col overflow-hidden" : "", activeTab === "preview" ? "block" : "hidden xl:block", "relative")}>
          <CardHeader className={fullscreen ? "shrink-0 border-b bg-card/70 p-2.5" : "p-3 border-b"}><CardTitle className="flex items-center gap-2 text-sm"><PanelRight className="h-4 w-4 text-primary" /> Live Preview</CardTitle></CardHeader>
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

function Preview({ preview, log, height = "780px" }: { preview: ReturnType<typeof parseLatexPreview>; log: string; height?: string }) {
  return (
    /* Outer canvas: dark gray scrollable area, like Overleaf/Word print view */
    <div
      className="overflow-auto rounded-md"
      style={{ height, background: "#404040" }}
    >
      {/* A4 paper: 595px wide × 842px tall (72dpi equivalent) with realistic margins */}
      <div
        className="mx-auto my-6"
        style={{
          width: "595px",
          minHeight: "842px",
          background: "#fff",
          boxShadow: "0 4px 32px rgba(0,0,0,0.45)",
          padding: "52px 56px 52px 56px",
          fontFamily: "'Computer Modern', 'Latin Modern', 'Times New Roman', Georgia, serif",
          fontSize: "10.5px",
          lineHeight: "1.42",
          color: "#111",
          boxSizing: "border-box"
        }}
      >
        {/* Header: Name + contact centered */}
        <header style={{ textAlign: "center", borderBottom: "1px solid #bbb", paddingBottom: "10px", marginBottom: "12px" }}>
          <div style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "0.01em" }}>{preview.name || "Your Name"}</div>
          {preview.contact && (
            <div style={{ fontSize: "9.5px", color: "#444", marginTop: "4px", lineHeight: "1.5" }}>{preview.contact}</div>
          )}
        </header>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {preview.sections.map((section) => (
            <div key={section.title}>
              <div style={{
                fontSize: "9px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#222",
                borderBottom: "0.8px solid #888",
                paddingBottom: "2px",
                marginBottom: "5px"
              }}>
                {section.title}
              </div>
              {section.items.length > 0 ? (
                <ul style={{ paddingLeft: "16px", margin: "0", listStyleType: "disc" }}>
                  {section.items.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: "2px", fontSize: "10px", lineHeight: "1.45", color: "#222" }}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: "0", fontSize: "10px", lineHeight: "1.5", color: "#222", whiteSpace: "pre-wrap" }}>{section.body}</p>
              )}
            </div>
          ))}
        </div>

        {/* Log line at very bottom */}
        {log && log !== "Live preview is shown until PDF compilation is enabled." && (
          <p style={{ marginTop: "24px", borderTop: "1px solid #ddd", paddingTop: "6px", fontSize: "8px", color: "#999" }}>{log}</p>
        )}
      </div>

      {/* Status chip below the paper */}
      <p style={{ textAlign: "center", color: "#aaa", fontSize: "10px", paddingBottom: "16px", marginTop: "6px" }}>
        A4 live preview · compile for PDF output
      </p>
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
