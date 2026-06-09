"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="flex flex-col items-center space-y-4">
        {/* Brand Logo Container */}
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-foreground shadow-md shadow-primary/20">
          <svg className="h-7 w-7 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
        </div>

        {/* Loading message */}
        <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Syncing workspace...</p>

        {/* Overleaf-style Infinite Progress Bar */}
        <div className="relative h-[3px] w-24 overflow-hidden rounded-full bg-muted/40">
          <div className="absolute inset-y-0 left-0 w-full bg-primary origin-left animate-infinite-progress rounded-full" />
        </div>
      </div>
    </div>
  );
}
