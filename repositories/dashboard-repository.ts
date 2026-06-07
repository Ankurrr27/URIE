import { prisma } from "@/lib/prisma";

export async function getDashboardStats(userId: string) {
  const [resumes, analyses, latest, nodes, recentResumes] = await Promise.all([
    prisma.resume.count({ where: { userId } }),
    prisma.atsScore.count({ where: { userId } }),
    prisma.atsScore.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.careerNode.count({ where: { userId } }),
    prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: { _count: { select: { sections: true } } }
    })
  ]);

  return { resumes, analyses, latest, nodes, recentResumes };
}
