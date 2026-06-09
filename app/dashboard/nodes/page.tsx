import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import type { CareerNode } from "@/types/career-node";
import { Badge } from "@/components/ui/badge";
import { NodeManager } from "@/components/nodes/node-manager";
import { listRecentCareerNodes } from "@/repositories/career-node-repository";

export default async function NodesPage() {
  const session = await auth();
  const nodes = await listRecentCareerNodes(session!.user.id);

  const serialized = nodes.map((node) => ({
    ...node,
    startDate: node.startDate?.toISOString() ?? null,
    endDate: node.endDate?.toISOString() ?? null,
    updatedAt: node.updatedAt.toISOString()
  })) as CareerNode[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">Node Manager</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Manage resume nodes</h1>
          <p className="mt-2 text-sm text-muted-foreground">Star important nodes, color-code categories, and delete nodes you no longer need.</p>
        </div>
        <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5">
          <Link href="/dashboard/universal/extract">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary animate-pulse" />
            Import from Resume PDF
          </Link>
        </Button>
      </div>
      <NodeManager initialNodes={serialized} />
    </div>
  );
}
