import { Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const themes = [
  { name: "Modern Minimal", className: "resume-theme-modern", accent: "Clean, crisp, product-minded layout." },
  { name: "Professional Corporate", className: "resume-theme-corporate", accent: "Formal typography for business and leadership roles." }
];

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">Templates</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Resume Themes</h1>
        <p className="mt-2 text-sm text-muted-foreground">Preview professional resume themes with customizable color and typography systems.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {themes.map((theme) => (
          <Card key={theme.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> {theme.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`rounded-lg border bg-white p-6 text-zinc-950 ${theme.className}`}>
                <h2 className="text-2xl font-bold" style={{ color: "hsl(var(--resume-accent))" }}>Jordan Lee</h2>
                <p className="text-sm text-zinc-600">Full Stack Engineer · jordan@example.com</p>
                <div className="mt-5">
                  <h3 className="border-b text-xs font-bold uppercase tracking-wide">Summary</h3>
                  <p className="mt-2 text-sm">Engineer with a track record of shipping reliable product systems and measurable performance gains.</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{theme.accent}</p>
              <Button variant="secondary">Use theme</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
