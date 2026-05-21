import Link from "next/link";
import { ArrowRight, FileText, Gauge, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { title: "Resume Builder", icon: FileText, text: "Structured sections, templates, live preview, and editable history." },
  { title: "ATS Analyzer", icon: Gauge, text: "PDF parsing, keyword matching, scoring, and improvement guidance." },
  { title: "AI Optimization", icon: Sparkles, text: "Generate summaries, improve bullets, and discover role-relevant skills." }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">ResuBee</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            AI resume building with ATS evidence built in.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            A single Next.js platform for authenticated resume editing, PDF analysis, AI writing assistance, LaTeX previews, and deployment-ready operations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/signup">
                Create account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{feature.text}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
