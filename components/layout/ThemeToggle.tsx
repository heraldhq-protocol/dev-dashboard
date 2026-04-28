"use client";

import * as React from "react";
import { Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <button
        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-text-muted hover:text-foreground transition-colors"
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-text-muted hover:text-foreground transition-colors cursor-pointer"
      aria-label="Toggle theme"
    >
      <Sun
        className="h-4 w-4 transition-transform duration-300 dark:scale-0 dark:-rotate-90"
        weight="bold"
      />
      <Moon
        className="absolute h-4 w-4 transition-transform duration-300 scale-0 rotate-90 dark:scale-100 dark:rotate-0"
        weight="bold"
      />
    </button>
  );
}
