import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UniversalResumeWorkspace } from "@/components/universal/universal-resume-workspace";
import type { CareerNode } from "@/types/career-node";

export default async function UniversalResumePage() {
  const session = await auth();
  const nodes = await prisma.careerNode.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ type: "asc" }, { updatedAt: "desc" }]
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
        <h1 className="text-2xl font-semibold tracking-tight">Universal Resume</h1>
        <p className="text-sm text-muted-foreground">
          Build a master node library of everything you have done, then compose targeted resumes by selecting the right evidence.
        </p>
      </div>
      <UniversalResumeWorkspace initialNodes={serialized} />
    </div>
  );
}
