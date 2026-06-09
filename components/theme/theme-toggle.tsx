"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const modes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor }
  ];

  if (!mounted) return <Button aria-label="Theme loading" variant="ghost" size="icon" disabled />;

  return (
    <div className="flex rounded-md bg-muted/40 p-0.5 border-0" role="group" aria-label="Theme">
      {modes.map((mode) => (
        <Button
          key={mode.value}
          type="button"
          variant={theme === mode.value ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7 rounded-sm"
          onClick={() => setTheme(mode.value)}
          aria-label={`Use ${mode.label} theme`}
          title={mode.label}
        >
          <mode.icon className="h-3.5 w-3.5" />
        </Button>
      ))}
    </div>
  );
}
