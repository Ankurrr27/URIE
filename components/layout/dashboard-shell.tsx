"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChevronLeft,
  ClipboardList,
  FileChartColumnIncreasing,
  FileText,
  GalleryVerticalEnd,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Settings,
  Sparkles,
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
      { href: "/dashboard/universal", label: "Add Node", icon: Sparkles },
      { href: "/dashboard/node-to-resume", label: "Node to Resume", icon: ClipboardList },
      { href: "/dashboard/nodes", label: "Node Manager", icon: GalleryVerticalEnd },
      { href: "/dashboard/resumes", label: "My Resumes", icon: FileText },
      { href: "/dashboard/ats", label: "ATS Analyzer", icon: FileChartColumnIncreasing }
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
      { href: "/dashboard/guide", label: "Guide", icon: GraduationCap },
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
      className={cn("flex h-full flex-col border-r bg-card/95 shadow-sm backdrop-blur-xl", collapsed ? "p-2" : "p-3")}
      aria-label="Dashboard navigation"
    >
      <div className={cn("flex items-center", collapsed ? "mb-1 justify-center" : "mb-2 justify-end")}>
        <Button variant="ghost" size="icon" className={cn("hidden md:inline-flex", collapsed && "h-8 w-8")} onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <Link href="/dashboard/profile" className={cn("flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent focus-ring", collapsed ? "mb-2 justify-center px-1 py-1.5" : "mb-3")}>
        <UserAvatar image={image} name={name ?? email} size="md" />
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name ?? "Your profile"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        ) : null}
      </Link>
      <Separator className={collapsed ? "mb-2" : "mb-3"} />

      <nav className={cn("flex-1 overflow-y-auto px-1", collapsed ? "space-y-2" : "space-y-5")}>
        {navGroups.map((group) => (
          <div key={group.title}>
            {!collapsed ? <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group.title}</p> : null}
            <div className={collapsed ? "space-y-0.5" : "space-y-1"}>
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground outline-none transition hover:bg-accent/80 hover:text-foreground focus-ring",
                      active && "bg-primary/10 text-primary ring-1 ring-primary/20 soft-ring",
                      collapsed ? "h-9 justify-center px-2" : "h-10"
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

      <Separator className={collapsed ? "my-2" : "my-3"} />
      <form action={signOutAction}>
        <Button variant="ghost" className={cn("w-full justify-start", collapsed && "h-9 justify-center px-2")} title={collapsed ? "Sign out" : undefined}>
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm font-medium">URIE - Universal Resume Intelligence Engine</p>
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
