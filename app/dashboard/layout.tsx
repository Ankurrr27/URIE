import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { FileText, Gauge, LayoutDashboard, Library, LogOut, Settings, TextCursorInput } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/universal", label: "Universal", icon: Library },
  { href: "/dashboard/resumes", label: "Resumes", icon: FileText },
  { href: "/dashboard/ats", label: "ATS", icon: Gauge },
  { href: "/dashboard/latex", label: "LaTeX", icon: TextCursorInput },
  { href: "/dashboard/profile", label: "Profile", icon: Settings }
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card/40 p-4 md:block">
        <Link href="/dashboard" className="text-lg font-semibold">ResuBee</Link>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <Button key={item.href} asChild variant="ghost" className="w-full justify-start">
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur">
          <div className="text-sm text-muted-foreground">{session.user.email}</div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button variant="ghost" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </form>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
