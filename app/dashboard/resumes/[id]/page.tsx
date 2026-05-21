import { auth } from "@/auth";
import { assertResumeOwner } from "@/services/resume";
import { ResumeEditor } from "@/components/resume/resume-editor";

export default async function ResumeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const resume = await assertResumeOwner(session!.user.id, id);
  return <ResumeEditor resume={resume as never} />;
}
