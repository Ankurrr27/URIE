import type { Resume } from "@/types/resume";

export function ResumePreview({ resume }: { resume: Resume }) {
  return (
    <div className="min-h-[720px] rounded-lg border bg-white p-8 text-zinc-950 shadow-sm">
      <header className="border-b pb-4">
        <h2 className="text-3xl font-bold">{String(resume.contact.name ?? "Your Name")}</h2>
        <p className="mt-1 text-sm text-zinc-600">
          {[resume.contact.email, resume.contact.phone, resume.contact.location].filter(Boolean).join(" | ")}
        </p>
      </header>
      <div className="mt-6 space-y-6">
        {resume.sections.filter((section) => section.visible).map((section) => (
          <section key={section.id}>
            <h3 className="border-b text-sm font-bold uppercase tracking-wide text-zinc-700">{section.title}</h3>
            <div className="mt-2 text-sm leading-6">
              <SectionContent content={section.content} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function SectionContent({ content }: { content: Record<string, unknown> }) {
  if (typeof content.text === "string") return <p>{content.text || "Add content..."}</p>;
  if (typeof content.summary === "string") {
    return (
      <div className="space-y-2">
        {content.organization ? <p className="font-semibold">{String(content.organization)}</p> : null}
        <p>{content.summary}</p>
        {Array.isArray(content.skills) && content.skills.length ? (
          <p className="text-xs text-zinc-600">Skills: {content.skills.join(", ")}</p>
        ) : null}
      </div>
    );
  }
  const items = Array.isArray(content.items) ? content.items : [];
  if (items.length) {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {items.map((item, index) => <li key={index}>{typeof item === "string" ? item : JSON.stringify(item)}</li>)}
      </ul>
    );
  }
  return <p className="text-zinc-500">Add structured content for this section.</p>;
}
