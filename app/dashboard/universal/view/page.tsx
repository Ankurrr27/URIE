import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categoryOrder = [
  "CONTACT_INFO",
  "SOCIAL_HANDLE",
  "CODING_PROFILE",
  "SUMMARY",
  "EDUCATION",
  "SKILL",
  "PROJECT",
  "EXPERIENCE",
  "CERTIFICATION",
  "ACHIEVEMENT",
  "RELEVANT_COURSEWORK",
  "POSITION_OF_RESPONSIBILITY",
  "CUSTOM"
];

export default async function ViewUniversalResumePage() {
  const session = await auth();
  const nodes = await prisma.careerNode.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ type: "asc" }, { updatedAt: "desc" }]
  });

  const grouped = categoryOrder
    .map((type) => ({
      type,
      label: titleCase(type),
      nodes: nodes.filter((node) => node.type === type)
    }))
    .filter((group) => group.nodes.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
            <Link href="/dashboard/universal">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Add nodes
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Universal resume</h1>
          <p className="text-sm text-muted-foreground">
            A read-only master view of every reusable career node saved in URIE.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/universal">
            <Plus className="mr-2 h-4 w-4" />
            Add new node
          </Link>
        </Button>
      </div>

      {grouped.length ? (
        <div className="space-y-4">
          {grouped.map((group) => (
            <Card key={group.type} className="surface-panel">
              <CardHeader>
                <CardTitle className="text-base">{group.label}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {group.nodes.map((node) => (
                  <div key={node.id} className="rounded-lg border bg-card/80 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-medium">{node.title}</h2>
                        {node.organization ? <p className="text-sm text-muted-foreground">{node.organization}</p> : null}
                      </div>
                      <Badge variant="secondary">{node.type.replaceAll("_", " ").toLowerCase()}</Badge>
                    </div>
                    {node.summary ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{node.summary}</p> : null}
                    {[...node.skills, ...node.keywords, ...node.tags].length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[...new Set([...node.skills, ...node.keywords, ...node.tags])].slice(0, 12).map((item) => (
                          <Badge key={item} variant="outline">{item}</Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="surface-panel">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">No universal resume nodes yet.</p>
            <Button asChild>
              <Link href="/dashboard/universal">
                <Plus className="mr-2 h-4 w-4" />
                Add your first node
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
