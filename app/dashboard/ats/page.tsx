import { AtsAnalyzer } from "@/components/ats/ats-analyzer";

export default function AtsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ATS Analyzer</h1>
        <p className="text-sm text-muted-foreground">Compare a PDF resume against a target job description.</p>
      </div>
      <AtsAnalyzer />
    </div>
  );
}
