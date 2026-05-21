import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createResumeAction } from "@/app/dashboard/resumes/resume-actions";

export default async function ResumesPage() {
  const session = await auth();
  const resumes = await prisma.resume.findMany({
    where: { userId: session!.user.id },
    orderBy: { updatedAt: "desc" },
    include: { template: true, _count: { select: { sections: true, atsScores: true } } }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resumes</h1>
          <p className="text-sm text-muted-foreground">Create, edit, and optimize resume versions.</p>
        </div>
        <form action={createResumeAction}>
          <Button>Create resume</Button>
        </form>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resumes.map((resume) => (
          <Card key={resume.id}>
            <CardHeader>
              <CardTitle className="text-base">{resume.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {resume._count.sections} sections · {resume._count.atsScores} analyses
              </div>
              <Button variant="secondary" asChild className="w-full">
                <Link href={`/dashboard/resumes/${resume.id}`}>Open editor</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
