import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getDashboardShellUser } from "@/repositories/user-repository";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await getDashboardShellUser(session.user.id);

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <DashboardShell email={user?.email ?? session.user.email} name={user?.name ?? session.user.name} image={user?.image ?? session.user.image} signOutAction={signOutAction}>
      {children}
    </DashboardShell>
  );
}
