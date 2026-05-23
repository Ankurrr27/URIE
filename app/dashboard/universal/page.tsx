import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UniversalResumeWorkspace } from "@/components/universal/universal-resume-workspace";

export default async function UniversalResumePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add career node</h1>
          <p className="text-sm text-muted-foreground">
            Save one reusable career fact at a time. Manage, color, star, and compose nodes from the dedicated tabs.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/dashboard/universal/view">
            <Eye className="mr-2 h-4 w-4" />
            View universal resume
          </Link>
        </Button>
      </div>
      <UniversalResumeWorkspace />
    </div>
  );
}
