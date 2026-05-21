import { LatexWorkspace } from "@/components/latex/latex-workspace";

export default function LatexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">LaTeX Editor</h1>
        <p className="text-sm text-muted-foreground">Edit LaTeX resumes with Monaco and compile when TeX is enabled in the runtime.</p>
      </div>
      <LatexWorkspace />
    </div>
  );
}
