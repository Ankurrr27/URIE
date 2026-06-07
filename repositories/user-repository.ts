import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const shellUserSelect = {
  name: true,
  email: true,
  image: true
} satisfies Prisma.UserSelect;

const publicProfileSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  headline: true,
  location: true,
  website: true,
  themePreference: true
} satisfies Prisma.UserSelect;

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function createCredentialsUser(data: { email: string; name: string; hashedPassword: string }) {
  return prisma.user.create({
    data,
    select: { id: true, email: true, name: true, role: true }
  });
}

export function getDashboardShellUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: shellUserSelect
  });
}

export function getProfileUser(userId: string) {
  return prisma.user.findUniqueOrThrow({ where: { id: userId } });
}

export function updateProfileUser(userId: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: publicProfileSelect
  });
}
