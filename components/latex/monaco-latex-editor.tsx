"use client";

import dynamic from "next/dynamic";
import type { OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[640px] items-center justify-center bg-zinc-950 text-sm text-zinc-400">
      Opening LaTeX editor...
    </div>
  )
});

export function MonacoLatexEditor({
  value,
  onChange,
  height
}: {
  value: string;
  onChange: (value: string) => void;
  height: string;
}) {
  const handleMount: OnMount = (editor, monaco) => {
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
              insertText: "\\begin{itemize}\n\\item ${1:Achievement}\n\\end{itemize}",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range
            },
            {
              label: "\\textbf{}",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "\\textbf{${1:Text}}",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
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
      theme="vs-dark"
      value={value}
      onMount={handleMount}
      onChange={(next) => onChange(next ?? "")}
      options={{
        automaticLayout: true,
        fontSize: 13,
        minimap: { enabled: false },
        renderLineHighlight: "all",
        scrollBeyondLastLine: false,
        tabSize: 2,
        wordWrap: "on"
      }}
    />
  );
}
