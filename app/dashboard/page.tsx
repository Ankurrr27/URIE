import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const [resumes, analyses, latest] = await Promise.all([
    prisma.resume.count({ where: { userId } }),
    prisma.atsScore.count({ where: { userId } }),
    prisma.atsScore.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 })
  ]);

  const average = latest.length ? Math.round(latest.reduce((sum, item) => sum + item.score, 0) / latest.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resume activity, ATS performance, and optimization history.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Resumes" value={resumes} />
        <Metric title="ATS analyses" value={analyses} />
        <Metric title="Recent average" value={`${average}%`} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent ATS history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {latest.length ? latest.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">Analysis score</div>
                <div className="text-xs text-muted-foreground">{item.createdAt.toLocaleString()}</div>
              </div>
              <Badge variant={item.score >= 75 ? "default" : "secondary"}>{item.score}%</Badge>
            </div>
          )) : <p className="text-sm text-muted-foreground">No analyses yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-3xl font-semibold">{value}</CardContent>
    </Card>
  );
}
