import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  Eye,
  FileText,
  Gauge,
  Github,
  Instagram,
  Layers3,
  Linkedin,
  MessageSquare,
  Palette,
  PenTool,
  Sparkles,
  Star,
  TextCursorInput,
  Users
} from "lucide-react";
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

      <footer className="relative border-t border-slate-800 bg-[#070D19] py-16 text-slate-400">
        {/* Top Glow Ambient Light */}
        <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-primary/5 via-primary/[0.01] to-transparent pointer-events-none" />

        {/* Stats card */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
          <div className="rounded-2xl border border-slate-800 bg-[#0B1528]/50 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 backdrop-blur-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Network Reach</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white tracking-tight">48,236</span>
                <span className="text-xs font-medium text-slate-400">total views</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5 items-center">
              {/* Pills */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/40 px-3.5 py-1.5 text-xs">
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-semibold text-white">12,450</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Users</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/40 px-3.5 py-1.5 text-xs">
                <FileText className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-semibold text-white">48,230</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Resumes</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/40 px-3.5 py-1.5 text-xs">
                <Gauge className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-semibold text-white">92,110</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Scans</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/40 px-3.5 py-1.5 text-xs">
                <Eye className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-semibold text-white">345,100</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Node Views</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/40 px-3.5 py-1.5 text-xs">
                <Palette className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-semibold text-white">129</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Templates</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/40 px-3.5 py-1.5 text-xs">
                <Activity className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-semibold text-white">99.9%</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Uptime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle sections */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-5 text-sm">
          {/* Column 1: Brand & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg tracking-tight hover:opacity-90 transition-all">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-foreground shadow-md shadow-primary/20">
                <svg className="h-6 w-6 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse border-2 border-background" />
              </div>
              <span>URIE Network</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 max-w-xs">
              An AI-powered resume orchestrator and intelligence engine. Store achievements once, generate tailored resumes, track ATS matches, and land your dream role.
            </p>
            <div className="flex gap-4 pt-2 text-slate-400">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <MessageSquare className="h-4 w-4" />
              </a>
              <a href="https://github.com/Ankurrr27/URIE" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Ecosystem */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Ecosystem</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Resume Builder</Link></li>
              <li><Link href="/dashboard/ats" className="text-slate-400 hover:text-white transition-colors">ATS Analyzer</Link></li>
              <li><Link href="/dashboard/latex" className="text-slate-400 hover:text-white transition-colors">LaTeX Workspace</Link></li>
              <li><Link href="/dashboard/assistant" className="text-slate-400 hover:text-white transition-colors">AI Suggestion Engine</Link></li>
            </ul>
          </div>

          {/* Column 3: Community */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Community</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="https://github.com/Ankurrr27/URIE" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Network Legacy</a></li>
              <li><Link href="/sitemap" className="text-slate-400 hover:text-white transition-colors">Our Team</Link></li>
              <li><a href="https://github.com/Ankurrr27/URIE" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Join the Team</a></li>
              <li><Link href="/dashboard/guide" className="text-slate-400 hover:text-white transition-colors">User Guide</Link></li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard/templates" className="text-slate-400 hover:text-white transition-colors">Gallery</Link></li>
              <li><Link href="/dashboard/guide" className="text-slate-400 hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/sitemap" className="text-slate-400 hover:text-white transition-colors">Branding Kit</Link></li>
              <li><Link href="/sitemap" className="text-slate-400 hover:text-white transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/sitemap" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/sitemap" className="text-slate-400 hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link href="/sitemap" className="text-slate-400 hover:text-white transition-colors">Community Guidelines</Link></li>
              <li><Link href="/sitemap" className="text-slate-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/sitemap" className="text-slate-400 hover:text-white transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider line */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-8">
          <div className="border-t border-slate-800/60" />
        </div>

        {/* Bottom credits */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          <div>
            CREATED BY ANKUR &middot; SRISHTI &middot; UTKARSH
          </div>
          <div>
            &copy; 2026 URIE NETWORK &middot; BUILT BY DEVELOPERS. FOR DEVELOPERS
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
