"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const name = String(formData.get("name") ?? "");

    try {
      if (isSignup) {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        if (!response.ok) throw new Error((await response.json()).error?.message ?? "Signup failed");
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Invalid email or password");
      router.push(params.get("callbackUrl") ?? "/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignup ? "Create your account" : "Welcome back"}</CardTitle>
          <CardDescription>{isSignup ? "Start building ATS-ready resumes." : "Continue optimizing your career documents."}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-4">
            {isSignup ? (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" autoComplete="name" required minLength={2} />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} required minLength={8} />
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSignup ? "Create account" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "New to ResuBee?"}{" "}
            <Link className="text-primary underline-offset-4 hover:underline" href={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Sign in" : "Create account"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
