import type { Resume } from "@/types/resume";

export function ResumePreview({ resume }: { resume: Resume }) {
  const theme = String(resume.settings.theme ?? "modern");
  const textSize = String(resume.settings.textSize ?? "compact");
  const defaultAccents: Record<string, string> = {
    modern: "#0f8fa3",
    corporate: "#1e3a5f",
    aiml: "#7c3aed",
    management: "#1e40af"
  };
  const accentColor = String(resume.settings.accentColor ?? defaultAccents[theme] ?? "#0f8fa3");
  const underlineSections = resume.settings.underlineSections !== false;
  const underlineLinks = resume.settings.underlineLinks !== false;
  const sizeClass = {
    compact: "text-[11.5px] leading-[1.4]",
    comfortable: "text-[13px] leading-[1.55]",
    large: "text-[14px] leading-[1.65]"
  }[textSize] ?? "text-[11.5px] leading-[1.4]";
  const headerSize = {
    compact: "text-xl",
    comfortable: "text-2xl",
    large: "text-3xl"
  }[textSize] ?? "text-xl";

  const themeClass = {
    corporate: "resume-theme-corporate",
    aiml: "resume-theme-aiml",
    management: "resume-theme-management"
  }[theme] ?? "resume-theme-modern";

  return (
    <div
      className={`mx-auto aspect-[8.5/11] max-h-[1120px] w-full max-w-[860px] overflow-hidden rounded-lg border bg-white p-6 text-zinc-950 shadow-sm ${sizeClass} ${themeClass}`}
      style={{ "--resume-accent": hexToHslTriplet(accentColor) } as React.CSSProperties}
    >
      <header className={underlineSections ? "border-b pb-3" : "pb-3"}>
        <h2 className={`${headerSize} font-bold`} style={{ color: "hsl(var(--resume-accent))", fontFamily: "var(--resume-font-heading)" }}>{String(resume.contact.name ?? "Your Name")}</h2>
        <p className="mt-1 text-[0.92em] text-zinc-600">
          {[resume.contact.email, resume.contact.phone, resume.contact.location].filter(Boolean).join(" | ")}
        </p>
        <LinkLine contact={resume.contact} underline={underlineLinks} />
      </header>
      <div className="mt-4 space-y-4">
        {resume.sections.filter((section) => section.visible).map((section) => (
          <section key={section.id}>
            <h3 className={`${underlineSections ? "border-b" : ""} text-[0.95em] font-bold uppercase text-zinc-700`}>{section.title}</h3>
            <div className="mt-1.5">
              <SectionContent content={section.content} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function LinkLine({ contact, underline }: { contact: Record<string, unknown>; underline: boolean }) {
  const links = [contact.website, contact.links]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  if (!links.length) return null;

  return (
    <p className="mt-1 flex flex-wrap gap-x-2 text-[0.9em] text-zinc-600">
      {links.map((link) => (
        <span key={link} className={underline ? "underline underline-offset-2" : ""}>{link}</span>
      ))}
    </p>
  );
}

function formatRichText(text: string) {
  if (!text) return "";
  
  // Split by URLs matching http/https or markdown bold **text**
  const tokenRegex = /(https?:\/\/[^\s]+)|(\*\*[^*]+\*\*)/g;
  const parts = text.split(tokenRegex);
  
  return parts.map((part, index) => {
    if (!part) return null;
    
    // Check if it's a URL
    if (part.startsWith("http://") || part.startsWith("https://")) {
      const cleanUrl = part.replace(/[.,;:)\]]+$/, "");
      const trailing = part.slice(cleanUrl.length);
      return (
        <span key={index}>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-85 transition-opacity"
            style={{ color: "hsl(var(--resume-accent))" }}
          >
            {cleanUrl}
          </a>
          {trailing}
        </span>
      );
    }
    
    // Check if it's bold
    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold">
          {content}
        </strong>
      );
    }
    
    // Normal text
    return <span key={index}>{part}</span>;
  });
}

function SectionContent({ content }: { content: Record<string, unknown> }) {
  if (typeof content.text === "string") {
    const lines = content.text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length > 1) {
      return (
        <ul className="list-disc space-y-1 pl-4 text-[0.95em] text-zinc-700 leading-relaxed">
          {lines.map((line, idx) => (
            <li key={idx} className="marker:text-zinc-400">
              {formatRichText(line)}
            </li>
          ))}
        </ul>
      );
    }
    return <p className="text-[0.95em] text-zinc-700 leading-relaxed whitespace-pre-wrap">{formatRichText(content.text) || "Add content..."}</p>;
  }
  if (typeof content.summary === "string") {
    const lines = content.summary
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return (
      <div className="space-y-1">
        {content.organization ? (
          <div className="flex justify-between items-start">
            <p className="font-semibold">{String(content.organization)}</p>
            {content.location ? <p className="text-xs text-zinc-500 font-medium">{String(content.location)}</p> : null}
          </div>
        ) : null}
        
        {lines.length > 1 ? (
          <ul className="list-disc space-y-1 pl-4 text-[0.95em] text-zinc-700 leading-relaxed">
            {lines.map((line, idx) => (
              <li key={idx} className="marker:text-zinc-400">
                {formatRichText(line)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[0.95em] text-zinc-700 leading-relaxed whitespace-pre-wrap">
            {formatRichText(content.summary)}
          </p>
        )}
        
        {Array.isArray(content.skills) && content.skills.length ? (
          <p className="text-xs text-zinc-500 italic mt-1.5">Skills: {content.skills.join(", ")}</p>
        ) : null}
      </div>
    );
  }
  const items = Array.isArray(content.items) ? content.items : [];
  if (items.length) {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {items.map((item, index) => (
          <li key={index} className="whitespace-pre-wrap">
            {typeof item === "string" ? formatRichText(item) : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-zinc-500">Add structured content for this section.</p>;
}

function hexToHslTriplet(hex: string) {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return "188 84% 32%";
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    if (max === g) h = (b - r) / d + 2;
    if (max === b) h = (r - g) / d + 4;
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
