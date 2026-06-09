import { LatexWorkspace } from "@/components/latex/latex-workspace";

export default function LatexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">LaTeX Resume Editor</h1>
        <p className="text-sm text-muted-foreground">Edit LaTeX resumes with Monaco editor, standard snippets, and live PDF compilation.</p>
      </div>
      <LatexWorkspace />
    </div>
  );
}
