"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/profile/user-avatar";

type ProfileUser = {
  name: string | null;
  email: string;
  image: string | null;
  headline: string | null;
  location: string | null;
  website: string | null;
  themePreference: string;
};

export function ProfileSettingsForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [image, setImage] = useState(user.image);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function uploadAvatar(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "profiles");
      const response = await fetch("/api/uploads/image", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Upload failed");
      setImage(payload.data.url);
      toast.success("Profile image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function saveProfile(formData: FormData) {
    const body = {
      name: String(formData.get("name") ?? ""),
      headline: String(formData.get("headline") ?? ""),
      location: String(formData.get("location") ?? ""),
      website: String(formData.get("website") ?? ""),
      themePreference: String(formData.get("themePreference") ?? "system"),
      image
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Could not save profile");
        toast.success("Profile saved");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save profile");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveProfile} className="grid gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <UserAvatar image={image} name={user.name ?? user.email} size="xl" />
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile image</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadAvatar(file);
                  }}
                />
                {uploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Camera className="h-5 w-5 text-muted-foreground" />}
              </div>
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP, or GIF. Max 3MB. Shown everywhere as a circular avatar.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field name="name" label="Name" defaultValue={user.name ?? ""} required />
            <Field name="email" label="Email" defaultValue={user.email} disabled />
            <Field name="headline" label="Headline" defaultValue={user.headline ?? ""} placeholder="Full-stack engineer, AI product builder" />
            <Field name="location" label="Location" defaultValue={user.location ?? ""} placeholder="City, Country" />
            <Field name="website" label="Website" defaultValue={user.website ?? ""} placeholder="https://your-site.com" />
            <div className="space-y-2">
              <Label htmlFor="themePreference">Theme preference</Label>
              <select id="themePreference" name="themePreference" defaultValue={user.themePreference ?? "system"} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="system">System</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>

          <Button className="w-fit" disabled={pending || uploading}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  required,
  disabled
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} placeholder={placeholder} required={required} disabled={disabled} />
    </div>
  );
}
