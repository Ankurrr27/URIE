import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">Profile</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Your public workspace identity</h1>
        <p className="mt-2 text-sm text-muted-foreground">Customize your name, avatar, and resume-facing profile details.</p>
      </div>
      <ProfileSettingsForm user={user} />
    </div>
  );
}
