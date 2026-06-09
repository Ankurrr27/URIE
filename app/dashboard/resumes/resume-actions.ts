"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createResume, assertResumeOwner } from "@/services/resume";
import { deleteResume } from "@/repositories/resume-repository";

export async function createResumeAction() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const resume = await createResume(session.user.id, { title: "Untitled Resume" });
  revalidatePath("/dashboard/resumes");
  redirect(`/dashboard/resumes/${resume.id}`);
}

export async function deleteResumeAction(resumeId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  
  // Verify ownership before deleting
  await assertResumeOwner(session.user.id, resumeId);
  await deleteResume(resumeId);
  
  revalidatePath("/dashboard/resumes");
}
