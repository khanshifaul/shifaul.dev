"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

export const ThemeBtn = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering theme-dependent content
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Show loading state while theme is being initialized
  if (!mounted) {
    return (
      <Button
        className="h-8 w-8 flex items-center justify-center rounded-full bg-muted hover:bg-accent hover:text-foreground transition-transform cursor-pointer"
        disabled
      >
        <div className="h-5 w-5 bg-muted-foreground rounded animate-pulse" />
      </Button>
    );
  }

  return (
    <Button
      onClick={toggleTheme}
      className="h-8 w-8 flex items-center justify-center rounded-full bg-muted hover:bg-accent hover:text-foreground transition-transform cursor-pointer"
    >
      {theme === "light" ? (
        <FaSun className="h-5 w-5 text-yellow-500 hover:text-primary" />
      ) : (
        <FaMoon className="h-5 w-5 text-silver-500 hover:text-primary" />
      )}
    </Button>
  );
};
