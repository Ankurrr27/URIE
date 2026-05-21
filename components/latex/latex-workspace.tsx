"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, FileCode2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="flex h-[640px] items-center justify-center text-sm text-muted-foreground">Opening editor...</div>
});

const starter = String.raw`\documentclass[10pt]{article}
\usepackage[margin=0.7in]{geometry}
\usepackage{enumitem}
\begin{document}
\begin{center}
{\LARGE Your Name}\\
email@example.com | +1 555 0100 | City, Country
\end{center}
\section*{Summary}
Full-stack engineer focused on reliable product systems and measurable business outcomes.
\section*{Experience}
\textbf{Senior Software Engineer} \hfill 2022--Present
\begin{itemize}[leftmargin=*]
\item Improved platform performance by 35\% by redesigning high-traffic API workflows.
\end{itemize}
\end{document}`;

export function LatexWorkspace() {
  const [source, setSource] = useState(starter);
  const [pdf, setPdf] = useState<string | null>(null);
  const [log, setLog] = useState<string>("Live preview is shown until PDF compilation is enabled.");
  const preview = useMemo(() => parseLatexPreview(source), [source]);

  async function compile() {
    const response = await fetch("/api/latex/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, engine: "pdflatex" })
    });
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload.error?.message ?? "Compilation failed");
      return;
    }
    setPdf(payload.data.pdfBase64 ? `data:application/pdf;base64,${payload.data.pdfBase64}` : null);
    setLog(payload.data.log);
    if (!payload.data.pdfBase64) toast.info("PDF compiler is disabled, showing live preview instead.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2"><FileCode2 className="h-5 w-5" /> LaTeX source</CardTitle>
          <Button size="sm" onClick={compile}><Play className="mr-2 h-4 w-4" /> Compile</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <MonacoEditor height="640px" language="latex" theme="vs-dark" value={source} onChange={(value) => setSource(value ?? "")} options={{ minimap: { enabled: false }, fontSize: 13 }} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {pdf ? (
            <iframe title="Compiled PDF" src={pdf} className="h-[640px] w-full rounded-md border bg-white" />
          ) : (
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
                      {section.items.length ? (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
                          {section.items.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm leading-6">{section.body}</p>
                      )}
                    </section>
                  ))}
                </div>
                <p className="mt-8 border-t pt-3 text-xs text-zinc-500">{log}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
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
    return {
      title: cleanLatex(match[1]),
      body: cleanLatex(body.replace(/\\begin\{itemize\}(?:\[[^\]]+\])?|\\end\{itemize\}|\\item\s+/g, "\n")).trim(),
      items
    };
  });

  return {
    name: centerLines[0]?.replace(/^LARGE\s+/, "") ?? "",
    contact: centerLines.slice(1).join(" | "),
    sections: sections.length ? sections : [{ title: "Preview", body: cleanLatex(document), items: [] }]
  };
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
