import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, BarChart3, FileText, Gauge, Library, TrendingUp } from "lucide-react";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AtsScoreChart } from "@/components/dashboard/charts/ats-score-chart";
import { getDashboardStats } from "@/repositories/dashboard-repository";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;
  const { resumes, analyses, latest, nodes, recentResumes } = await getDashboardStats(userId);

  const average = latest.length ? Math.round(latest.reduce((sum, item) => sum + item.score, 0) / latest.length) : 0;
  const profileCompletion = Math.min(100, resumes * 18 + nodes * 8 + analyses * 14);
  const chartData = latest
    .slice()
    .reverse()
    .map((item) => ({ label: item.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" }), score: item.score }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge variant="secondary" className="mb-3">Dashboard</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {session.user.name ?? "builder"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Track resume readiness, ATS progress, and your universal career library.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary"><Link href="/dashboard/universal">Add career node</Link></Button>
          <Button asChild><Link href="/dashboard/resumes">Create resume</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Resumes" value={resumes} icon={FileText} detail="Saved resume versions" tone="primary" />
        <Metric title="Universal nodes" value={nodes} icon={Library} detail="Reusable career facts" tone="success" />
        <Metric title="ATS analyses" value={analyses} icon={Gauge} detail="Job matches tested" tone="warning" />
        <Metric title="Average score" value={`${average}%`} icon={TrendingUp} detail="Recent ATS average" tone="primary" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> ATS score trend</CardTitle>
            <CardDescription>Recent score movement across analyzed job descriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length ? <AtsScoreChart data={chartData} /> : <EmptyState text="Run an ATS analysis to see score trends." />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile completion</CardTitle>
            <CardDescription>Based on resumes, nodes, and ATS activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Career readiness</span>
              <span className="text-2xl font-semibold">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} />
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p>Next best action: add quantified career nodes with skills and ATS keywords.</p>
              <Button asChild variant="outline" className="mt-2"><Link href="/dashboard/guide">Read optimization guide</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent resumes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentResumes.length ? recentResumes.map((resume) => (
              <Link key={resume.id} href={`/dashboard/resumes/${resume.id}`} className="flex items-center justify-between rounded-md border p-3 transition hover:border-primary">
                <div>
                  <p className="font-medium">{resume.title}</p>
                  <p className="text-xs text-muted-foreground">{resume._count.sections} sections · updated {resume.updatedAt.toLocaleDateString()}</p>
                </div>
                <Badge variant="outline">{resume.status.toLowerCase()}</Badge>
              </Link>
            )) : <EmptyState text="No resumes yet." />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Activity timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latest.length ? latest.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">ATS analysis completed</p>
                  <Badge variant={item.score >= 75 ? "default" : "secondary"}>{item.score}%</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.createdAt.toLocaleString()}</p>
              </div>
            )) : <EmptyState text="No activity yet." />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  title,
  value,
  icon: Icon,
  detail,
  tone
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  detail: string;
  tone: "primary" | "success" | "warning";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary ring-primary/15",
    success: "bg-success/10 text-success ring-success/15",
    warning: "bg-warning/10 text-warning ring-warning/15"
  }[tone];

  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <span className={`rounded-md p-2 ring-1 ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{text}</div>;
}
