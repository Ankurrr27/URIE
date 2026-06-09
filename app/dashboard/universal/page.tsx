import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { listCareerNodes } from "@/repositories/career-node-repository";
import { Button } from "@/components/ui/button";
import { UniversalResumeWorkspace } from "@/components/universal/universal-resume-workspace";

export default async function UniversalResumePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const rawNodes = await listCareerNodes({ userId: session.user.id });
  const nodes = JSON.parse(JSON.stringify(rawNodes));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add career node</h1>
          <p className="text-sm text-muted-foreground">
            Save one reusable career fact at a time. Manage, color, star, and compose nodes from the dedicated tabs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5">
            <Link href="/dashboard/universal/extract">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Auto-extract facts
            </Link>
          </Button>
        </div>
      </div>
      <UniversalResumeWorkspace initialNodes={nodes} />
    </div>
  );
}
