"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  ChevronLeft,
  FileText,
  Gauge,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Palette,
  Settings,
  TextCursorInput,
  UserRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/profile/user-avatar";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/universal", label: "Universal", icon: Library },
      { href: "/dashboard/resumes", label: "My Resumes", icon: FileText },
      { href: "/dashboard/ats", label: "ATS Analyzer", icon: Gauge }
    ]
  },
  {
    title: "Creation",
    items: [
      { href: "/dashboard/templates", label: "Templates", icon: Palette },
      { href: "/dashboard/latex", label: "LaTeX Editor", icon: TextCursorInput },
      { href: "/dashboard/assistant", label: "AI Assistant", icon: Bot }
    ]
  },
  {
    title: "Account",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/dashboard/guide", label: "Guide", icon: BookOpen },
      { href: "/dashboard/profile", label: "Profile", icon: UserRound }
    ]
  }
];

export function DashboardShell({
  children,
  email,
  name,
  image,
  signOutAction
}: {
  children: React.ReactNode;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useLocalStorage("resubee-sidebar-collapsed", false);
  const [mobileOpen, setMobileOpen] = useLocalStorage("resubee-sidebar-mobile", false);

  const sidebar = (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 84 : 280 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex h-full flex-col border-r bg-card/90 p-3 shadow-sm backdrop-blur"
      aria-label="Dashboard navigation"
    >
      <div className="flex h-12 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 rounded-md px-2 focus-ring">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">RB</span>
          {!collapsed ? <span className="text-lg font-semibold">ResuBee</span> : null}
        </Link>
        <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setCollapsed((value) => !value)} aria-label="Toggle sidebar">
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <Separator className="my-3" />
      <Link href="/dashboard/profile" className={cn("mb-3 flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent focus-ring", collapsed && "justify-center")}>
        <UserAvatar image={image} name={name ?? email} size="md" />
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name ?? "Your profile"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        ) : null}
      </Link>
      <Separator className="mb-3" />

      <nav className="flex-1 space-y-5 overflow-y-auto px-1">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!collapsed ? <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group.title}</p> : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground outline-none transition hover:bg-accent hover:text-foreground focus-ring",
                      active && "bg-primary/10 text-primary ring-1 ring-primary/20",
                      collapsed && "justify-center px-2"
                    )}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed ? <span>{item.label}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Separator className="my-3" />
      <form action={signOutAction}>
        <Button variant="ghost" className={cn("w-full justify-start", collapsed && "justify-center px-2")} title={collapsed ? "Sign out" : undefined}>
          <LogOut className="h-4 w-4" />
          {!collapsed ? <span className="ml-2">Sign out</span> : null}
        </Button>
      </form>
    </motion.aside>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-40 hidden md:block">{sidebar}</div>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div className="fixed inset-0 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-background/70 backdrop-blur-sm" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ duration: 0.22 }} className="absolute inset-y-0 left-0 w-[280px]">
              {sidebar}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div initial={false} animate={{ paddingLeft: collapsed ? 84 : 280 }} transition={{ duration: 0.22 }} className="hidden md:block" />
      <div className={cn("min-h-screen transition-[padding] duration-200", collapsed ? "md:pl-[84px]" : "md:pl-[280px]")}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm font-medium">Career command center</p>
              <p className="hidden text-xs text-muted-foreground sm:block">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard/profile" aria-label="Open profile" className="focus-ring rounded-full">
              <UserAvatar image={image} name={name ?? email} size="sm" />
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
