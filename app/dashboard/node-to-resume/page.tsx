import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NodeToResume } from "@/components/nodes/node-to-resume";
import type { CareerNode } from "@/types/career-node";

export default async function NodeToResumePage() {
  const session = await auth();
  const nodes = await prisma.careerNode.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ updatedAt: "desc" }]
  });

  const serialized = nodes.map((node) => ({
    ...node,
    startDate: node.startDate?.toISOString() ?? null,
    endDate: node.endDate?.toISOString() ?? null,
    updatedAt: node.updatedAt.toISOString()
  })) as CareerNode[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Node to Resume</h1>
        <p className="text-sm text-muted-foreground">
          Pick existing nodes from your universal library and generate a tailored one-page resume draft.
        </p>
      </div>
      <NodeToResume initialNodes={serialized} />
    </div>
  );
}
