"use client";

import * as React from "react";
import { Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors relative w-9 h-9"
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      className="inline-flex items-center justify-center p-2 w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors relative cursor-pointer"
      aria-label="Toggle theme"
    >
      <Sun
        className="h-5 w-5 transition-transform duration-300 dark:scale-0 dark:-rotate-90"
        weight="bold"
      />
      <Moon
        className="absolute h-5 w-5 transition-transform duration-300 scale-0 rotate-90 dark:scale-100 dark:rotate-0"
        weight="bold"
      />
    </button>
  );
}
