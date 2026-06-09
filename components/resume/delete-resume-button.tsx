"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteResumeAction } from "@/app/dashboard/resumes/resume-actions";

export function DeleteResumeButton({ resumeId, resumeTitle }: { resumeId: string; resumeTitle: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Are you sure you want to delete the resume "${resumeTitle}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteResumeAction(resumeId);
        toast.success("Resume deleted successfully");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete resume");
      }
    });
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      disabled={pending}
      onClick={handleDelete}
      aria-label={`Delete resume ${resumeTitle}`}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin text-destructive" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
