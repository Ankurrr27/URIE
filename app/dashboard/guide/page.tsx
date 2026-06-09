import { Badge } from "@/components/ui/badge";
import { GuideContent } from "@/components/guide/guide-content";

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">URIE Guide</h1>
        <p className="mt-2 text-sm text-muted-foreground">Learn how to build, analyze, and optimize targeted resumes.</p>
      </div>
      <GuideContent />
    </div>
  );
}
