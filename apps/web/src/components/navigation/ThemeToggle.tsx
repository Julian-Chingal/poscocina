import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';

export const ThemeToggle: React.FC = () => {
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
        className="size-8 text-muted-foreground hover:text-foreground"
        aria-label="Cargando tema..."
        disabled
      >
        <Sun className="size-4 opacity-40" />
      </Button>
    );
  }

  const isDark = (resolvedTheme || theme) === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
      aria-label="Alternar tema claro u oscuro"
      className="size-8 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      {isDark ? (
        <Sun className="size-4 transition-transform duration-200 rotate-0 hover:rotate-45 text-amber-400" />
      ) : (
        <Moon className="size-4 transition-transform duration-200 -rotate-12 hover:rotate-0 text-slate-700" />
      )}
    </Button>
  );
};
