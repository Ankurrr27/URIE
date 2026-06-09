"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, Sparkles, X, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardGuideBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("urie-guide-banner-dismissed");
    if (!isDismissed) {
      setVisible(true);
    }
  }, []);

  function handleDismiss() {
    localStorage.setItem("urie-guide-guide-dismissed-at", new Date().toISOString());
    localStorage.setItem("urie-guide-banner-dismissed", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <Card className="relative overflow-hidden border border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-card p-0 shadow-md">
      <div className="absolute top-0 right-0 p-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={handleDismiss}
          aria-label="Dismiss onboarding guide"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Brain className="h-5 w-5 animate-pulse" />
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5">
                Quick Concept: How URIE Works
                <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary uppercase">
                  <Sparkles className="h-2.5 w-2.5" /> Pipeline
                </span>
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                URIE manages career accomplishments as **Atomic Career Nodes** instead of standard static text. Here is how you build and target them:
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-background/50 p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</span>
                  <h3 className="text-xs font-semibold">Decompose Resume</h3>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Upload your existing resume. URIE parses and isolates each job entry, project, and skill as standalone **Career Nodes**.
                </p>
              </div>

              <div className="rounded-lg border bg-background/50 p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10 text-[10px] font-bold text-success">2</span>
                  <h3 className="text-xs font-semibold">Manage Fact Library</h3>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Refine details, add tags or skills, color-code, and star your highest impact facts in the **Node Manager**.
                </p>
              </div>

              <div className="rounded-lg border bg-background/50 p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent-foreground">3</span>
                  <h3 className="text-xs font-semibold">Compose & Optimize</h3>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Select key nodes, build a customized resume draft, and use the **ATS Analyzer** to match job requirements.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1.5">
              <Button asChild size="sm" className="h-8 text-xs">
                <Link href="/dashboard/universal/extract">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Auto-extract PDF
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                <Link href="/dashboard/guide">
                  Read Optimization Guide <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={handleDismiss}>
                Got it, hide this
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
