import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bot, Check, FileText, Gauge, Layers3, PenTool, Sparkles, Star, TextCursorInput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/fade-in";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const features = [
  { title: "ATS Analyzer", icon: Gauge, text: "Score uploaded PDFs against real job descriptions with keyword gaps and prioritized fixes." },
  { title: "AI Suggestions", icon: Bot, text: "Generate summaries, improve bullets, and suggest honest skills for each target role." },
  { title: "Resume Templates", icon: Layers3, text: "Switch between clean ATS-safe layouts and premium branded resume themes." },
  { title: "LaTeX Editing", icon: TextCursorInput, text: "Use Monaco-powered LaTeX editing with live preview, snippets, and template presets." },
  { title: "PDF Export", icon: FileText, text: "Prepare polished resume outputs with typography and theme controls." }
];

const faqs = [
  ["Is URIE only for technical resumes?", "No. The node-based universal resume model works for product, finance, research, business, and technical roles."],
  ["Does the ATS score guarantee interviews?", "No tool can guarantee interviews, but URIE helps align evidence, language, and structure with the job description."],
  ["Can I keep multiple resume versions?", "Yes. Build one universal career library, then compose focused resumes for different roles."]
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground text-lg tracking-tight">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent-foreground shadow-sm shadow-primary/20">
              <svg className="h-5.5 w-5.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 animate-pulse border border-background" />
            </div>
            <span>URIE</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#templates" className="hover:text-foreground">Templates</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="secondary" className="hidden sm:inline-flex"><Link href="/login">Sign in</Link></Button>
            <Button asChild><Link href="/signup">Start free</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.18),transparent_35%),radial-gradient(circle_at_70%_10%,hsl(var(--accent)/0.28),transparent_30%)]" />
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8">
          <FadeIn>
            <Badge variant="secondary" className="mb-5">AI Resume Builder + ATS Analyzer</Badge>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Universal Resume Intelligence Engine.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              URIE helps you store every achievement once, compose focused resumes for each job, analyze ATS fit, and refine your language with AI.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="/signup">Create resume <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/login">Open dashboard</Link></Button>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="rounded-xl border bg-card p-3 shadow-2xl">
              <div className="rounded-lg border bg-background p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">ATS Match</p>
                    <p className="text-3xl font-semibold text-primary">87%</p>
                  </div>
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div className="mt-5 grid gap-3">
                  {["Added Kubernetes keyword naturally", "Improved 3 impact bullets", "Composed Senior Full Stack resume"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-md border p-3 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Section id="features" title="Everything a serious resume workflow needs" eyebrow="Features">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {features.map((feature, index) => (
            <FadeIn key={feature.title} delay={index * 0.04}>
              <Card className="h-full">
                <CardHeader>
                  <feature.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{feature.text}</CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section id="templates" title="Resume templates that look sharp and parse cleanly" eyebrow="Templates">
        <div className="grid gap-6 lg:grid-cols-2">
          {["Modern Minimal", "Professional Corporate"].map((name) => (
            <Card key={name} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`rounded-lg border bg-white p-6 text-zinc-950 ${name.includes("Corporate") ? "resume-theme-corporate" : "resume-theme-modern"}`}>
                  <h3 className="text-2xl font-bold" style={{ color: "hsl(var(--resume-accent))" }}>Avery Johnson</h3>
                  <p className="text-sm text-zinc-600">Senior Product Engineer | ats-ready@example.com</p>
                  <div className="mt-5 space-y-3 text-sm">
                    <p className="font-semibold uppercase tracking-wide">Experience</p>
                    <p>Led full-stack platform work that improved application completion by 31%.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="How it works" eyebrow="Workflow">
        <div className="grid gap-4 md:grid-cols-3">
          {["Build your universal resume nodes", "Select the best evidence for a role", "Analyze ATS score and export"].map((step, index) => (
            <Card key={step}>
              <CardHeader><CardTitle className="text-base">{index + 1}. {step}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">A guided workflow keeps your content reusable, targeted, and measurable.</CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Loved by focused job seekers" eyebrow="Testimonials">
        <div className="grid gap-4 md:grid-cols-3">
          {["The universal resume model finally made targeting roles sane.", "The ATS feedback is practical, not vague.", "LaTeX preview plus AI bullets is a killer combo."].map((quote) => (
            <Card key={quote}>
              <CardContent className="pt-5">
                <div className="mb-3 flex gap-1 text-primary">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <p className="text-sm text-muted-foreground">"{quote}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="pricing" title="Simple pricing UI" eyebrow="Pricing">
        <div className="grid gap-4 md:grid-cols-3">
          {["Starter", "Pro", "Team"].map((plan, index) => (
            <Card key={plan} className={index === 1 ? "border-primary shadow-lg" : ""}>
              <CardHeader><CardTitle>{plan}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-semibold">{index === 0 ? "$0" : index === 1 ? "$12" : "$39"}<span className="text-sm text-muted-foreground">/mo</span></p>
                <Button className="w-full" variant={index === 1 ? "default" : "secondary"}>Choose {plan}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="faq" title="Questions before you start?" eyebrow="FAQ">
        <div className="grid gap-3">
          {faqs.map(([question, answer]) => (
            <Card key={question}>
              <CardHeader><CardTitle className="text-base">{question}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">{answer}</CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <footer className="border-t bg-card/40 backdrop-blur-md py-16 text-sm text-muted-foreground transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-foreground text-lg tracking-tight">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent-foreground shadow-sm shadow-primary/20">
                <svg className="h-5.5 w-5.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 animate-pulse border border-background" />
              </div>
              <span>URIE</span>
            </Link>
            <p className="text-xs leading-relaxed max-w-xs text-muted-foreground">
              Universal Resume Intelligence Engine. AI resume building, ATS match analysis, and role-specific career library orchestration.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["Next.js", "Tailwind", "Monaco", "Prisma", "Zod", "AI"].map((tag) => (
                <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0 bg-background/50 border-muted font-mono">{tag}</Badge>
              ))}
            </div>
            <div className="pt-2">
              <a
                href="https://github.com/Ankurrr27/URIE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub Repository
              </a>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">API Engine Endpoints</h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1 py-0.5 rounded mr-1">POST</span>
                <span className="text-muted-foreground hover:text-foreground transition-colors">/api/ai/bullets</span>
              </li>
              <li>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1 py-0.5 rounded mr-1">POST</span>
                <span className="text-muted-foreground hover:text-foreground transition-colors">/api/ats/analyze</span>
              </li>
              <li>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1 py-0.5 rounded mr-1">POST</span>
                <span className="text-muted-foreground hover:text-foreground transition-colors">/api/latex/compile</span>
              </li>
              <li>
                <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1 py-0.5 rounded mr-1">GET</span>
                <span className="text-muted-foreground hover:text-foreground transition-colors">/api/resumes</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Engine Statistics</h4>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="border border-border/40 rounded-lg p-2 bg-muted/20">
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-sm font-semibold text-foreground font-mono mt-0.5">12,450</p>
              </div>
              <div className="border border-border/40 rounded-lg p-2 bg-muted/20">
                <p className="text-xs text-muted-foreground">Resumes</p>
                <p className="text-sm font-semibold text-foreground font-mono mt-0.5">48,230</p>
              </div>
              <div className="border border-border/40 rounded-lg p-2 bg-muted/20">
                <p className="text-xs text-muted-foreground">ATS Scans</p>
                <p className="text-sm font-semibold text-foreground font-mono mt-0.5">92,110</p>
              </div>
              <div className="border border-border/40 rounded-lg p-2 bg-muted/20">
                <p className="text-xs text-muted-foreground">Node Views</p>
                <p className="text-sm font-semibold text-foreground font-mono mt-0.5">345,100</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">URIE Topology</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/sitemap" className="hover:text-foreground transition-colors font-medium text-primary flex items-center gap-1">Visual Sitemap <ArrowUpRight className="h-3 w-3" /></Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard Workspace</Link></li>
              <li><Link href="/dashboard/universal/extract" className="hover:text-foreground transition-colors">PDF Auto-Extractor</Link></li>
              <li className="pt-1 text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 mt-2">
                Designed & engineered by <strong className="text-foreground">Ankurrr27</strong> & <strong className="text-primary"><Link href="/sitemap">Antigravity</Link></strong> (DeepMind partner).
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 URIE. Universal Resume Intelligence Engine. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap Index</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Register Account</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Section({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <FadeIn>
        <Badge variant="outline" className="mb-4">{eyebrow}</Badge>
        <h2 className="mb-8 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      </FadeIn>
      {children}
    </section>
  );
}
