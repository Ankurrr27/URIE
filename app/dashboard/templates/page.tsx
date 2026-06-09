import { Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useThemeAction } from "./actions";

const themes = [
  { name: "Modern Minimal", slug: "ats-classic", className: "resume-theme-modern", accent: "Clean, crisp, one-page product-minded layout." },
  { name: "Professional Corporate", slug: "professional-corporate", className: "resume-theme-corporate", accent: "Formal one-page typography for business and leadership roles." },
  { name: "SDE One Page", slug: "sde-one-page", className: "resume-theme-modern", accent: "Compact software engineering one-page layout with education, skills, projects, coursework, achievements, and responsibility sections." },
  { name: "AI / ML Engineer", slug: "aiml-engineer", className: "resume-theme-modern", accent: "One-page layout built for ML engineers: experience, projects, skills (ML/DL, LLMs, MLOps), and education." },
  { name: "Management Role", slug: "management-role", className: "resume-theme-corporate", accent: "Executive one-page layout for product managers and leaders: summary, leadership experience, key achievements, and skills." }
];

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">One-page resume themes</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pick a theme to create a blank resume and open the editor immediately.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <Card key={theme.name} className="surface-panel shadow-sm flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4.5 w-4.5 text-primary" /> {theme.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className={`rounded-lg border bg-white p-5 text-zinc-950 aspect-[8.5/11] flex flex-col justify-between shadow-inner ${theme.className}`}>
                  {theme.slug === "sde-one-page" ? <SdeLayoutPreview /> : theme.slug === "professional-corporate" ? <CorporateThemePreview /> : theme.slug === "aiml-engineer" ? <AiMlThemePreview /> : theme.slug === "management-role" ? <ManagementThemePreview /> : <DefaultThemePreview />}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{theme.accent}</p>
              </div>
              <form action={useThemeAction} className="pt-2">
                <input type="hidden" name="themeSlug" value={theme.slug} />
                <Button className="w-full text-xs h-8.5 bg-primary text-primary-foreground hover:bg-primary/95">Use this theme</Button>
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
    <div className="flex-1 flex flex-col justify-between text-[7px] text-zinc-900 leading-normal">
      <header className="border-b-[0.5px] border-zinc-200 pb-1 flex flex-col">
        <h4 className="text-[10px] font-bold text-teal-600 tracking-tight leading-tight">Alex Morgan</h4>
        <p className="text-[6px] text-zinc-500">alex@example.com | linkedin.com/in/alex | github.com/alex</p>
      </header>
      <div className="flex-1 space-y-2 mt-2">
        <div>
          <h5 className="border-b-[0.5px] border-zinc-200 text-[6.5px] font-bold uppercase tracking-wider text-zinc-700">Summary</h5>
          <p className="mt-0.5 text-zinc-600">Product engineer focused on reliable systems, product velocity, and measurable business outcomes.</p>
        </div>
        <div>
          <h5 className="border-b-[0.5px] border-zinc-200 text-[6.5px] font-bold uppercase tracking-wider text-zinc-700">Experience</h5>
          <div className="mt-0.5 flex justify-between font-bold text-[6px]">
            <span>Senior Software Engineer</span>
            <span className="text-zinc-500 font-normal">2022 -- Present</span>
          </div>
          <ul className="mt-0.5 list-disc pl-2.5 text-zinc-600 text-[5.5px] space-y-0.5">
            <li>Improved API latency by 38% by redesigning database access patterns.</li>
            <li>Led migration to Kubernetes for services handling 2M monthly requests.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CorporateThemePreview() {
  return (
    <div className="flex-1 flex flex-col justify-between text-[7px] text-zinc-900 leading-normal font-serif">
      <header className="border-b-[0.5px] border-zinc-300 pb-1 text-center">
        <h4 className="text-[10px] font-bold text-blue-900 tracking-tight uppercase leading-tight">Corporate Leader</h4>
        <p className="text-[5.5px] text-zinc-500 font-sans mt-0.5">leader@example.com | New York, NY | +1 555-0199</p>
      </header>
      <div className="flex-1 space-y-2 mt-2">
        <div>
          <h5 className="border-b-[0.5px] border-zinc-300 text-[6.5px] font-bold uppercase tracking-wider text-zinc-800 text-center">Executive Summary</h5>
          <p className="mt-0.5 text-zinc-600 font-sans text-[6px]">Operations and product leader with experience scaling teams, revenue operations, and enterprise delivery.</p>
        </div>
        <div>
          <h5 className="border-b-[0.5px] border-zinc-300 text-[6.5px] font-bold uppercase tracking-wider text-zinc-800 text-center">Leadership Experience</h5>
          <div className="mt-0.5 flex justify-between font-bold text-[6px] font-sans">
            <span>Director of Operations</span>
            <span className="text-zinc-500 font-normal">2020 -- Present</span>
          </div>
          <ul className="mt-0.5 list-disc pl-2.5 text-zinc-600 font-sans text-[5.5px] space-y-0.5">
            <li>Reduced operating costs by 18% while improving customer response SLAs.</li>
            <li>Collaborated with product teams to align strategic roadmaps.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SdeLayoutPreview() {
  const sections = ["Education", "Skills", "Experience", "Projects", "Achievements"];
  return (
    <div className="flex-1 flex flex-col justify-between text-[7px] text-zinc-900 leading-normal">
      <header className="text-center border-b-[0.5px] border-zinc-200 pb-0.5 flex flex-col">
        <h4 className="text-[9px] font-bold text-slate-800 tracking-tight leading-tight">Jordan Smith</h4>
        <p className="text-[5.5px] text-zinc-500">stanford@edu | github.com/jordan | +1 555-0100</p>
      </header>
      <div className="flex-1 mt-1.5 space-y-1">
        {sections.map((section) => (
          <div key={section} className="space-y-0.5">
            <h5 className="border-b-[0.5px] border-zinc-200 text-[6px] font-bold uppercase tracking-wider text-zinc-700 leading-none">{section}</h5>
            <div className="h-1 bg-zinc-100 rounded-xs w-full opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AiMlThemePreview() {
  return (
    <div className="flex-1 flex flex-col justify-between text-[7px] text-zinc-900 leading-normal">
      <header className="border-b-[0.5px] border-zinc-200 pb-1 flex flex-col">
        <h4 className="text-[9px] font-bold text-violet-700 tracking-tight leading-tight">Priya Sharma</h4>
        <p className="text-[5.5px] text-zinc-500">priya@aimail.com | github.com/priya-ml | Bengaluru</p>
      </header>
      <div className="flex-1 mt-1.5 space-y-1.5">
        <div>
          <h5 className="border-b-[0.5px] border-zinc-200 text-[6px] font-bold uppercase tracking-wider text-zinc-700">Experience</h5>
          <div className="mt-0.5 flex justify-between font-bold text-[6px]">
            <span>ML Engineer — NLP Platform</span>
            <span className="text-zinc-500 font-normal">2023–Present</span>
          </div>
          <ul className="mt-0.5 list-disc pl-2.5 text-zinc-600 text-[5.5px] space-y-0.5">
            <li>Fine-tuned LLaMA-3 with RLHF; +22% user preference score.</li>
            <li>Reduced inference latency 41% via TensorRT quantization.</li>
          </ul>
        </div>
        <div>
          <h5 className="border-b-[0.5px] border-zinc-200 text-[6px] font-bold uppercase tracking-wider text-zinc-700">Skills</h5>
          <p className="mt-0.5 text-zinc-600 text-[5.5px]">PyTorch · HuggingFace · LangChain · vLLM · MLflow · GKE</p>
        </div>
        <div>
          <h5 className="border-b-[0.5px] border-zinc-200 text-[6px] font-bold uppercase tracking-wider text-zinc-700">Education</h5>
          <p className="mt-0.5 text-zinc-600 text-[5.5px] font-bold">M.Tech, Artificial Intelligence — IIT Bombay</p>
        </div>
      </div>
    </div>
  );
}

function ManagementThemePreview() {
  return (
    <div className="flex-1 flex flex-col justify-between text-[7px] text-zinc-900 leading-normal font-serif">
      <header className="border-b-[0.5px] border-zinc-300 pb-1 text-center">
        <h4 className="text-[9px] font-bold text-blue-900 tracking-tight leading-tight">Jordan Lee</h4>
        <p className="text-[5.5px] text-zinc-500 font-sans">jordan@corp.com | linkedin.com/in/jordan | New York</p>
      </header>
      <div className="flex-1 space-y-1.5 mt-1.5">
        <div>
          <h5 className="border-b-[0.5px] border-zinc-300 text-[6px] font-bold uppercase tracking-wider text-zinc-800">Summary</h5>
          <p className="mt-0.5 text-zinc-600 font-sans text-[5.5px]">Strategic product leader with 8+ yrs driving cross-functional teams and P&L ownership.</p>
        </div>
        <div>
          <h5 className="border-b-[0.5px] border-zinc-300 text-[6px] font-bold uppercase tracking-wider text-zinc-800">Leadership Experience</h5>
          <div className="mt-0.5 flex justify-between font-bold text-[6px] font-sans">
            <span>Director of Product</span>
            <span className="text-zinc-500 font-normal">2022–Present</span>
          </div>
          <ul className="mt-0.5 list-disc pl-2.5 text-zinc-600 font-sans text-[5.5px] space-y-0.5">
            <li>Led 3 product squads to deliver $4.2M ARR growth in 18 months.</li>
            <li>Defined OKR framework across 6 business units; +30% delivery.</li>
          </ul>
        </div>
        <div>
          <h5 className="border-b-[0.5px] border-zinc-300 text-[6px] font-bold uppercase tracking-wider text-zinc-800">Key Achievements</h5>
          <ul className="mt-0.5 list-disc pl-2.5 text-zinc-600 font-sans text-[5.5px] space-y-0.5">
            <li>Grew team from 8 to 35 in 2 years.</li>
            <li>Recognized Top Performer Q3 2023, 140% of revenue target.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
