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

  const renderSidebar = (isMobile: boolean = false) => {
    const isCollapsed = isMobile ? false : collapsed;
    return (
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 64 : 220 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={cn("flex h-full flex-col border-r bg-card/95 shadow-sm backdrop-blur-xl", isCollapsed ? "p-2" : "p-3")}
        aria-label="Dashboard navigation"
      >
        <div className={cn("flex items-center", isCollapsed ? "mb-1 justify-center" : "mb-2 justify-end")}>
          {!isMobile ? (
            <Button variant="ghost" size="icon" className="hidden md:inline-flex h-8 w-8" onClick={() => setCollapsed((value) => !value)} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Link href="/dashboard/profile" className={cn("flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent focus-ring", isCollapsed ? "mb-2 justify-center px-1 py-1.5" : "mb-3")}>
          <UserAvatar image={image} name={name ?? email} size={isCollapsed ? "sm" : "md"} />
          {!isCollapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name ?? "Your profile"}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          ) : null}
        </Link>
        <Separator className={isCollapsed ? "mb-2" : "mb-3"} />

        <nav className={cn("flex-1 overflow-y-auto px-1", isCollapsed ? "space-y-2" : "space-y-4")}>
          {navGroups.map((group) => (
            <div key={group.title}>
              {!isCollapsed ? <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/85">{group.title}</p> : null}
              <div className={isCollapsed ? "space-y-0.5" : "space-y-1"}>
                {group.items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-3 text-xs font-medium text-muted-foreground outline-none transition hover:bg-accent/80 hover:text-foreground focus-ring",
                        active && "bg-primary/10 text-primary ring-1 ring-primary/20 soft-ring",
                        isCollapsed ? "h-8 justify-center px-2" : "h-9"
                      )}
                      aria-current={active ? "page" : undefined}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed ? <span>{item.label}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <Separator className={isCollapsed ? "my-2" : "my-3"} />
        <form action={signOutAction}>
          <Button variant="ghost" className={cn("w-full justify-start", isCollapsed && "h-8 justify-center px-2")} title={isCollapsed ? "Sign out" : undefined}>
            <LogOut className="h-4 w-4" />
            {!isCollapsed ? <span className="ml-2 text-xs">Sign out</span> : null}
          </Button>
        </form>
      </motion.aside>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-40 hidden md:block">{renderSidebar(false)}</div>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div className="fixed inset-0 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-background/70 backdrop-blur-sm" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ duration: 0.22 }} className="absolute inset-y-0 left-0 w-[220px]">
              {renderSidebar(true)}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div initial={false} animate={{ paddingLeft: collapsed ? 64 : 220 }} transition={{ duration: 0.22 }} className="hidden md:block" />
      <div className={cn("min-h-screen transition-[padding] duration-200", collapsed ? "md:pl-[64px]" : "md:pl-[220px]")}>
        <header className="sticky top-0 z-30 flex h-11 items-center justify-between border-b bg-background/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-5.5 w-5.5 items-center justify-center rounded bg-gradient-to-br from-primary to-accent-foreground shadow-xs">
                <svg className="h-3.5 w-3.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold sm:hidden tracking-tight">URIE</p>
                <p className="hidden text-xs font-bold sm:block tracking-tight font-semibold">URIE <span className="text-[10px] text-muted-foreground font-normal">| Universal Resume Intelligence Engine</span></p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/dashboard/profile" aria-label="Open profile" className="focus-ring rounded-full">
              <UserAvatar image={image} name={name ?? email} size="sm" />
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-3 sm:p-4 lg:p-5 flex flex-col justify-between min-h-[calc(100vh-44px)]">
          <div className="flex-1 pb-6">{children}</div>
          <footer className="border-t pt-3.5 pb-4 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-muted-foreground/80">
            <p>
              © 2026 URIE · Designed & Developed by <strong className="text-foreground">Ankurrr27</strong> & <strong className="text-foreground">Antigravity (DeepMind Partner)</strong>
            </p>
            <div className="flex gap-3">
              <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link>
              <Link href="/dashboard/guide" className="hover:text-foreground transition-colors">Help Guide</Link>
              <Link href="/dashboard/profile" className="hover:text-foreground transition-colors">Profile</Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
