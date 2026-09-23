import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-8 text-muted-foreground/50", className)}
        aria-label="Cargando selector de tema..."
        disabled
      >
        <Sun className="size-4 shrink-0 opacity-40" strokeWidth={2} />
      </Button>
    );
  }

  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
      aria-label={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
      className={cn(
        "size-8 text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
        className,
      )}
    >
      {isDark ? (
        <Sun
          className="size-4 shrink-0 transition-transform duration-200 rotate-0 hover:rotate-45 text-amber-400"
          strokeWidth={2}
          aria-hidden="true"
        />
      ) : (
        <Moon
          className="size-4 shrink-0 transition-transform duration-200 -rotate-12 hover:rotate-0 text-foreground"
          strokeWidth={2}
          aria-hidden="true"
        />
      )}
    </Button>
  );
};
