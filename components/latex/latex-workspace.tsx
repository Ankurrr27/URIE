"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Expand, FileCode2, Minimize2, Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonacoLatexEditor } from "@/components/latex/monaco-latex-editor";

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
Next.js, TypeScript, PostgreSQL, Prisma, Kubernetes, observability
\end{document}`,
  "Research Resume": String.raw`\documentclass[10pt]{article}
\usepackage[margin=0.75in]{geometry}
\begin{document}
\begin{center}
{\LARGE Research Candidate}\\
research@example.com | Google Scholar | ORCID
\end{center}
\section*{Research Interests}
Human-centered AI, document intelligence, information retrieval, and evaluation systems.
\section*{Publications}
\begin{itemize}
\item First Author, "Evaluating Resume Optimization Systems", 2026.
\end{itemize}
\section*{Projects}
Built reproducible experiments for ranking job-resume alignment methods.
\end{document}`,
  "Academic CV": String.raw`\documentclass[11pt]{article}
\usepackage[margin=0.8in]{geometry}
\begin{document}
\begin{center}
{\LARGE Academic CV}\\
department@example.edu | University Department
\end{center}
\section*{Education}
Ph.D. Candidate, Computer Science \hfill 2026
\section*{Teaching}
\begin{itemize}
\item Teaching Assistant, Data Structures and Algorithms.
\end{itemize}
\section*{Awards}
Graduate Research Fellowship, Department Research Award.
\end{document}`,
  "Corporate Resume": String.raw`\documentclass[10pt]{article}
\usepackage[margin=0.7in]{geometry}
\begin{document}
\begin{center}
{\LARGE Corporate Leader}\\
leader@example.com | New York, NY
\end{center}
\section*{Executive Summary}
Operations and product leader with experience scaling teams, revenue operations, and enterprise delivery.
\section*{Leadership Experience}
\textbf{Director of Operations} \hfill 2020--Present
\begin{itemize}
\item Reduced operating costs by 18\% while improving customer response SLAs.
\end{itemize}
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

  async function compile() {
    const response = await fetch("/api/latex/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, engine: "pdflatex" })
    });
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload.error?.message ?? "Compilation failed");
      setLog(payload.error?.message ?? "Compilation failed");
      return;
    }
    setPdf(payload.data.pdfBase64 ? `data:application/pdf;base64,${payload.data.pdfBase64}` : null);
    setLog(payload.data.log);
    toast[payload.data.pdfBase64 ? "success" : "info"](payload.data.pdfBase64 ? "PDF compiled" : "Compiler disabled, showing live preview");
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

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 overflow-auto bg-background p-4" : ""}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {Object.keys(templates).map((name) => (
            <Button key={name} size="sm" variant="secondary" onClick={() => setSource(templates[name as keyof typeof templates])}>{name}</Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={downloadPdf}><Download className="mr-2 h-4 w-4" /> PDF</Button>
          <Button size="sm" variant="outline" onClick={() => setFullscreen((value) => !value)}>{fullscreen ? <Minimize2 className="mr-2 h-4 w-4" /> : <Expand className="mr-2 h-4 w-4" />}{fullscreen ? "Exit" : "Fullscreen"}</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2"><FileCode2 className="h-5 w-5" /> LaTeX source</CardTitle>
              <Button size="sm" onClick={compile}><Play className="mr-2 h-4 w-4" /> Compile</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {snippets.map((snippet) => <Button key={snippet.label} size="sm" variant="outline" onClick={() => insertSnippet(snippet.value)}>{snippet.label}</Button>)}
              <Badge variant="secondary" className="ml-auto"><Save className="mr-1 h-3 w-3" /> Autosaved {savedAt ?? "soon"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {errors.length ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {errors.map((error) => <p key={error}>{error}</p>)}
              </div>
            ) : null}
            <div className="overflow-hidden rounded-md border">
              <MonacoLatexEditor
                height={fullscreen ? "72vh" : "640px"}
                value={source}
                onChange={setSource}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Live preview</CardTitle></CardHeader>
          <CardContent>{pdf ? <iframe title="Compiled PDF" src={pdf} className="h-[640px] w-full rounded-md border bg-white" /> : <Preview preview={preview} log={log} />}</CardContent>
        </Card>
      </div>
    </div>
  );
}

function Preview({ preview, log }: { preview: ReturnType<typeof parseLatexPreview>; log: string }) {
  return (
    <div className="h-[640px] overflow-auto rounded-md border bg-zinc-100 p-6 text-zinc-950">
      <div className="mx-auto min-h-full max-w-[720px] bg-white p-10 shadow-sm">
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
