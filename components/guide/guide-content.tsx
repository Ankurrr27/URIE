"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const sections = [
  {
    id: "create",
    title: "How to create a resume",
    body: "Start with Universal Resume nodes. Add every relevant project, role, skill, education item, and proof point once. Then compose a targeted resume from the best nodes for each role."
  },
  {
    id: "extract",
    title: "Decomposing Resumes via AI Auto-Extraction",
    body: "Save time by uploading your existing PDF resume to URIE's Auto-Extractor. The system reads the PDF structure, parses the raw text block, and uses advanced AI model schemas to decompose your achievements into atomic, structured Career Nodes. You can then review, edit, star, color-code, and reuse these nodes in the Node Manager library."
  },
  {
    id: "ats",
    title: "How ATS scoring works",
    body: "URIE extracts text from your PDF, compares it to job-description keywords, checks structure signals, and highlights missing role language."
  },
  {
    id: "improve",
    title: "How to improve ATS score",
    body: "Add missing keywords naturally, quantify achievements, use standard section names, and put the most relevant evidence near the top."
  },
  {
    id: "latex",
    title: "How to use LaTeX editor",
    body: "Choose a preset, edit in Monaco, use snippets for common resume structures, and rely on live preview until PDF compilation is enabled."
  },
  {
    id: "tips",
    title: "Resume writing tips",
    body: "Lead with outcomes, use action verbs, include metrics, avoid dense paragraphs, and tailor each resume to a specific job description."
  }
];

export function GuideContent() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return sections;
    return sections.filter((section) => `${section.title} ${section.body}`.toLowerCase().includes(needle));
  }, [query]);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guide" />
            </div>
            <nav className="space-y-1 text-sm">
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className="block rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                  {section.title}
                </a>
              ))}
            </nav>
          </CardContent>
        </Card>
      </aside>
      <div className="space-y-4">
        {filtered.map((section) => (
          <Card key={section.id} id={section.id}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>{section.body}</p>
              {section.id === "latex" ? (
                <pre className="overflow-x-auto rounded-md border bg-muted p-4 text-xs text-foreground">
                  <code>{String.raw`\section*{Experience}
\textbf{Software Engineer} \hfill 2022--Present
\begin{itemize}
\item Improved API latency by 38\% by redesigning caching and query patterns.
\end{itemize}`}</code>
                </pre>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
