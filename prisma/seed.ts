import { PrismaClient, TemplateCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.template.upsert({
    where: { slug: "ats-classic" },
    update: {},
    create: {
      name: "ATS Classic",
      slug: "ats-classic",
      category: TemplateCategory.ATS,
      description: "Single-column, parser-friendly resume template for large ATS systems.",
      config: {
        font: "Inter",
        density: "compact",
        accent: "zinc",
        sections: ["SUMMARY", "EXPERIENCE", "SKILLS", "EDUCATION", "PROJECTS"]
      }
    }
  });

  await prisma.template.upsert({
    where: { slug: "technical-latex" },
    update: {},
    create: {
      name: "Technical LaTeX",
      slug: "technical-latex",
      category: TemplateCategory.LATEX,
      description: "LaTeX-first engineering template with strong project and publication support.",
      config: {
        engine: "pdflatex",
        margin: "0.65in",
        sections: ["SUMMARY", "EXPERIENCE", "PROJECTS", "SKILLS", "EDUCATION"]
      }
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
