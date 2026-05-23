import { Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useThemeAction } from "@/app/dashboard/templates/actions";

const themes = [
  { name: "Modern Minimal", slug: "ats-classic", className: "resume-theme-modern", accent: "Clean, crisp, one-page product-minded layout." },
  { name: "Professional Corporate", slug: "professional-corporate", className: "resume-theme-corporate", accent: "Formal one-page typography for business and leadership roles." },
  { name: "SDE One Page", slug: "sde-one-page", className: "resume-theme-modern", accent: "Compact software engineering one-page layout with education, skills, projects, coursework, achievements, and responsibility sections." }
];

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">Templates</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">One-page resume themes</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pick a theme to create a blank resume and open the editor immediately.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {themes.map((theme) => (
          <Card key={theme.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> {theme.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`rounded-lg border bg-white p-6 text-zinc-950 ${theme.className}`}>
                {theme.name === "SDE One Page" ? <SdeLayoutPreview /> : <DefaultThemePreview />}
              </div>
              <p className="text-sm text-muted-foreground">{theme.accent}</p>
              <form action={useThemeAction}>
                <input type="hidden" name="themeSlug" value={theme.slug} />
                <Button variant="secondary">Use theme</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DefaultThemePreview() {
  return (
    <>
      <h2 className="text-2xl font-bold" style={{ color: "hsl(var(--resume-accent))" }}>Your Name</h2>
      <p className="text-sm text-zinc-600">Target Role | email@example.com</p>
      <div className="mt-5">
        <h3 className="border-b text-xs font-bold uppercase tracking-wide">Summary</h3>
        <p className="mt-2 text-sm">Outcome-focused professional summary tailored to the target job.</p>
      </div>
    </>
  );
}

function SdeLayoutPreview() {
  const sections = ["Education", "Skills", "Projects", "Relevant Coursework", "Achievements", "Positions of Responsibility"];
  return (
    <>
      <h2 className="text-center text-2xl font-bold" style={{ color: "hsl(var(--resume-accent))" }}>Your Name</h2>
      <p className="text-center text-xs text-zinc-600">Email | LinkedIn | GitHub | LeetCode | GFG | Portfolio</p>
      <div className="mt-5 grid gap-3">
        {sections.map((section) => (
          <div key={section}>
            <h3 className="border-b text-xs font-bold uppercase tracking-wide">{section}</h3>
            <p className="mt-1 text-xs text-zinc-600">Blank field group ready to be filled from universal resume nodes.</p>
          </div>
        ))}
      </div>
    </>
  );
}
