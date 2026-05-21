"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createResume } from "@/services/resume";

export async function createResumeAction() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const resume = await createResume(session.user.id, { title: "Untitled Resume" });
  revalidatePath("/dashboard/resumes");
  redirect(`/dashboard/resumes/${resume.id}`);
}
