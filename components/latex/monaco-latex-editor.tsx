"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import dynamic from "next/dynamic";
import type { OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-muted text-sm text-muted-foreground" style={{ height: "780px" }}>
      Opening LaTeX editor…
    </div>
  )
});

export type MonacoLatexEditorHandle = {
  formatLatex: () => void;
};

function _MonacoLatexEditor(
  {
    value,
    onChange,
    height,
    monacoTheme = "vs-dark"
  }: {
    value: string;
    onChange: (value: string) => void;
    height: string;
    monacoTheme?: "vs" | "vs-dark";
  },
  ref: React.Ref<MonacoLatexEditorHandle>
) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  // Expose formatLatex() to parent via ref
  useImperativeHandle(ref, () => ({
    formatLatex() {
      const editor = editorRef.current;
      if (!editor) return;
      const raw = editor.getValue();
      const formatted = prettifyLatex(raw);
      editor.setValue(formatted);
      onChange(formatted);
    }
  }));

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.languages.registerCompletionItemProvider("latex", {
      provideCompletionItems(model: Monaco.editor.ITextModel, position: Monaco.Position) {
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: model.getWordUntilPosition(position).startColumn,
          endColumn: model.getWordUntilPosition(position).endColumn
        };
        return {
          suggestions: [
            {
              label: "\\section*{}",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "\\section*{${1:Section}}\n${2:Content}",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range
            },
            {
              label: "\\begin{itemize}",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "\\begin{itemize}[leftmargin=*,itemsep=0pt,topsep=2pt]\n  \\item ${1:Achievement}\n\\end{itemize}",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range
            },
            {
              label: "\\textbf{}",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "\\textbf{${1:Text}}",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range
            },
            {
              label: "\\textit{}",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "\\textit{${1:Text}}",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range
            },
            {
              label: "\\hfill",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "\\hfill ",
              range
            }
          ]
        };
      }
    });

    editor.focus();
  };

  return (
    <MonacoEditor
      height={height}
      language="latex"
      theme={monacoTheme}
      value={value}
      onMount={handleMount}
      onChange={(next) => onChange(next ?? "")}
      options={{
        automaticLayout: true,
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        renderLineHighlight: "all",
        scrollBeyondLastLine: false,
        tabSize: 2,
        wordWrap: "on",
        lineNumbers: "on",
        glyphMargin: false,
        folding: true,
        bracketPairColorization: { enabled: true }
      }}
    />
  );
}

export const MonacoLatexEditor = forwardRef(_MonacoLatexEditor);

// ── LaTeX Prettifier ───────────────────────────────────────────────────────
function prettifyLatex(source: string): string {
  const lines = source.split("\n");
  const result: string[] = [];
  let indent = 0;
  let blankCount = 0;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    // Track blank lines — collapse >1 consecutive blanks into 1
    if (trimmed === "") {
      blankCount++;
      if (blankCount <= 1) result.push("");
      continue;
    }
    blankCount = 0;

    // Decrease indent BEFORE printing \end lines
    if (/^\\end\{/.test(trimmed)) indent = Math.max(0, indent - 1);

    // Special: \item always gets 2-space indent inside its environment
    const isItem = /^\\item/.test(trimmed);
    const effectiveIndent = isItem ? indent : indent;
    result.push("  ".repeat(effectiveIndent) + trimmed);

    // Increase indent AFTER printing \begin lines (except \begin{document})
    if (/^\\begin\{/.test(trimmed) && !/^\\begin\{document\}/.test(trimmed)) {
      indent++;
    }
  }

  // Remove leading/trailing blank lines
  while (result.length && result[0] === "") result.shift();
  while (result.length && result[result.length - 1] === "") result.pop();

  return result.join("\n");
}
