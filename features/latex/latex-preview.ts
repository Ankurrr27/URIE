export type LatexPreviewSection = {
  title: string;
  body: string;
  items: string[];
};

export type LatexPreviewModel = {
  name: string;
  contact: string;
  sections: LatexPreviewSection[];
};

export function parseLatexPreview(source: string): LatexPreviewModel {
  const document = source.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/)?.[1] ?? source;
  const center = document.match(/\\begin\{center\}([\s\S]*?)\\end\{center\}/)?.[1] ?? "";
  const centerLines = cleanLatex(center).split(/\n|\\\\/).map((line) => line.trim()).filter(Boolean);
  const sections = [...document.matchAll(/\\section\*\{([^}]+)\}([\s\S]*?)(?=\\section\*\{|\\end\{document\}|$)/g)].map((match) => {
    const body = match[2].trim();
    const items = [...body.matchAll(/\\item\s+(.+)/g)].map((item) => cleanLatex(item[1]));
    return {
      title: cleanLatex(match[1]),
      body: cleanLatex(body.replace(/\\begin\{itemize\}(?:\[[^\]]+\])?|\\end\{itemize\}|\\item\s+/g, "\n")).trim(),
      items
    };
  });

  return {
    name: centerLines[0]?.replace(/^LARGE\s+/, "") ?? "",
    contact: centerLines.slice(1).join(" | "),
    sections: sections.length ? sections : [{ title: "Preview", body: cleanLatex(document), items: [] }]
  };
}

export function lintLatex(source: string) {
  const errors: string[] = [];
  const beginItemize = (source.match(/\\begin\{itemize\}/g) ?? []).length;
  const endItemize = (source.match(/\\end\{itemize\}/g) ?? []).length;
  if (!source.includes("\\begin{document}")) errors.push("Missing \\begin{document}.");
  if (!source.includes("\\end{document}")) errors.push("Missing \\end{document}.");
  if (beginItemize !== endItemize) errors.push("Unbalanced itemize environment.");
  return errors;
}

function cleanLatex(value: string) {
  return value
    .replace(/\\textbf\{([^}]+)\}/g, "$1")
    .replace(/\{\\LARGE\s+([^}]+)\}/g, "$1")
    .replace(/\\hfill/g, " ")
    .replace(/\\%/g, "%")
    .replace(/\\\$/g, "$")
    .replace(/\\\\/g, "\n")
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]+\])?(?:\{([^}]*)\})?/g, "$1")
    .replace(/[{}]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}
