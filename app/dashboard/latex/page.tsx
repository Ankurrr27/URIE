import { LatexWorkspace } from "@/components/latex/latex-workspace";

export default function LatexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">LaTeX Editor</h1>
        <p className="text-sm text-muted-foreground">Edit LaTeX resumes with Monaco, snippets, autosave, live preview, and optional PDF compilation.</p>
      </div>
      <LatexWorkspace />
    </div>
  );
}
