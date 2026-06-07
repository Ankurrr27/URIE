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
      <div>
        <Badge variant="secondary" className="mb-3">Node Manager</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Manage resume nodes</h1>
        <p className="mt-2 text-sm text-muted-foreground">Star important nodes, color-code categories, and delete nodes you no longer need.</p>
      </div>
      <NodeManager initialNodes={serialized} />
    </div>
  );
}
