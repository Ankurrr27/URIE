import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Compass, Shield, Layout, FileText, Settings, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const sitemapData = [
  {
    category: "Public Platform",
    icon: Compass,
    color: "text-primary",
    items: [
      { name: "Home Landing Page", href: "/", desc: "Features, template previews, pricing tiers, FAQs, and main intro." },
      { name: "Sitemap (This Page)", href: "/sitemap", desc: "Interactive, structured map of the entire URIE application topology." },
      { name: "Sign In Portal", href: "/login", desc: "Access your dashboard, resumes, and career node library." },
      { name: "Sign Up / Registration", href: "/signup", desc: "Create a new free account to start managing your career data." }
    ]
  },
  {
    category: "Universal Library Core",
    icon: Layout,
    color: "text-success",
    items: [
      { name: "Add Career Fact (Node)", href: "/dashboard/universal", desc: "Add single accomplishments, skills, positions, and details manually." },
      { name: "View Master Resume", href: "/dashboard/universal/view", desc: "View the unified read-only master profile containing all facts." },
      { name: "Resume PDF Auto-Extractor", href: "/dashboard/universal/extract", desc: "Upload existing resume PDF and parse it into standalone nodes using AI." }
    ]
  },
  {
    category: "Resume Customization",
    icon: FileText,
    color: "text-accent-foreground",
    items: [
      { name: "Tailored Resume Creator", href: "/dashboard/node-to-resume", desc: "Select specific achievements and nodes to compose target drafts." },
      { name: "My Saved Resumes", href: "/dashboard/resumes", desc: "List all customized resume versions, statuses, and updates." },
      { name: "Monaco LaTeX Editor", href: "/dashboard/latex", desc: "Full LaTeX code editor featuring Monaco snippets and live preview." },
      { name: "Branded Themes & Templates", href: "/dashboard/templates", desc: "Browse and select ATS-safe layouts and professional resume styles." }
    ]
  },
  {
    category: "Tools & Accounts",
    icon: Settings,
    color: "text-warning",
    items: [
      { name: "Node Manager", href: "/dashboard/nodes", desc: "Search, star, delete, and color-code facts inline." },
      { name: "ATS Match Analyzer", href: "/dashboard/ats", desc: "Test resumes against job descriptions to optimize keyword fits." },
      { name: "AI Assistant", href: "/dashboard/assistant", desc: "Chat with a resume optimization agent for tips and bullets rewrite." },
      { name: "Optimization Guide", href: "/dashboard/guide", desc: "URIE guide explaining ATS rules, resume tips, and LaTeX structures." },
      { name: "Profile & Settings", href: "/dashboard/profile", desc: "Edit personal info, website links, and change dark/light themes." }
    ]
  }
];

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-2 py-0.5 text-xs font-semibold">URIE Topology</Badge>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">SEO Index</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
            URIE Application Map
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Explore the structural pathways, creation engines, and settings portals that power the Universal Resume Intelligence Engine.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {sitemapData.map((section) => (
            <Card key={section.category} className="border bg-card/50 shadow-xs hover:shadow-sm transition">
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <section.icon className={`h-4.5 w-4.5 ${section.color}`} />
                    {section.category}
                  </CardTitle>
                  <CardDescription className="text-[11px]">System endpoints and features</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4 px-0">
                <div className="divide-y">
                  {section.items.map((item) => (
                    <div key={item.name} className="p-4 hover:bg-accent/20 transition flex flex-col justify-between gap-1 group">
                      <div className="flex items-center justify-between">
                        <Link href={item.href} className="text-xs font-medium text-foreground hover:text-primary transition flex items-center gap-1">
                          {item.name}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Badge variant="outline" className="text-[8px] font-mono select-all">
                          {item.href}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <footer className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 URIE. Built by Ankurrr27 & Antigravity (Google DeepMind AAC Partner).</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/login" className="hover:text-foreground">Sign In</Link>
            <Link href="/dashboard" className="hover:text-foreground">Workspace</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
