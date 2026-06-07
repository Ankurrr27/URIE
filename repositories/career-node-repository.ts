import type { CareerNodeType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function createCareerNodeRecord(data: Prisma.CareerNodeUncheckedCreateInput) {
  return prisma.careerNode.create({ data });
}

export function listCareerNodes(input: { userId: string; type?: CareerNodeType; q?: string }) {
  return prisma.careerNode.findMany({
    where: {
      userId: input.userId,
      ...(input.type ? { type: input.type } : {}),
      ...(input.q
        ? {
            OR: [
              { title: { contains: input.q, mode: "insensitive" as const } },
              { organization: { contains: input.q, mode: "insensitive" as const } },
              { tags: { has: input.q } },
              { skills: { has: input.q } },
              { keywords: { has: input.q } }
            ]
          }
        : {})
    },
    orderBy: [{ type: "asc" }, { updatedAt: "desc" }]
  });
}

export function listRecentCareerNodes(userId: string) {
  return prisma.careerNode.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }]
  });
}

export function listVisibleCareerNodesByIds(userId: string, nodeIds: string[]) {
  return prisma.careerNode.findMany({
    where: {
      id: { in: nodeIds },
      userId,
      visibility: true
    },
    orderBy: [{ type: "asc" }, { startDate: "desc" }, { updatedAt: "desc" }]
  });
}

export function findCareerNodeForUser(userId: string, id: string) {
  return prisma.careerNode.findFirst({ where: { id, userId } });
}

export function updateCareerNode(id: string, data: Prisma.CareerNodeUpdateInput) {
  return prisma.careerNode.update({ where: { id }, data });
}

export function deleteCareerNode(id: string) {
  return prisma.careerNode.delete({ where: { id } });
}
