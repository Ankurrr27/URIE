"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createResumeFromTheme } from "@/services/resume";

export async function useThemeAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const themeSlug = String(formData.get("themeSlug") ?? "modern-minimal");
  const resume = await createResumeFromTheme(session.user.id, themeSlug);
  redirect(`/dashboard/resumes/${resume.id}`);
}
