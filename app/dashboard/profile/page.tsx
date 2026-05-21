import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Profile data used across resume templates and analytics.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input defaultValue={user.name ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={user.email} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input defaultValue={user.role} readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
