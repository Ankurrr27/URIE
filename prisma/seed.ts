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

  await prisma.template.upsert({
    where: { slug: "sde-one-page" },
    update: {},
    create: {
      name: "SDE One Page",
      slug: "sde-one-page",
      category: TemplateCategory.TECHNICAL,
      description: "Compact software engineering layout with contact handles, education, skills, projects, coursework, achievements, and positions of responsibility.",
      config: {
        layout: "single-page-sde",
        sections: [
          "CONTACT_INFO",
          "SOCIAL_HANDLE",
          "CODING_PROFILE",
          "EDUCATION",
          "SKILL",
          "PROJECT",
          "RELEVANT_COURSEWORK",
          "ACHIEVEMENT",
          "POSITION_OF_RESPONSIBILITY",
          "CERTIFICATION"
        ],
        note: "Blank layout only. User-specific information is never seeded."
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
