import React, { useState, useEffect, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface TopBarSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isHome: boolean;
  onNavigateHome: () => void;
  debounceMs?: number;
  className?: string;
}

export const TopBarSearch: React.FC<TopBarSearchProps> = ({
  searchQuery,
  onSearchChange,
  isHome,
  onNavigateHome,
  debounceMs = 150,
  className,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [, startTransition] = useTransition();

  // Sync external changes (e.g. cleared or reset by parent)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Debounced search propagation with non-blocking React transition
  useEffect(() => {
    if (inputValue === searchQuery) return;

    const handler = setTimeout(() => {
      startTransition(() => {
        onSearchChange(inputValue);
        if (!isHome && inputValue.trim().length > 0) {
          onNavigateHome();
        }
      });
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, searchQuery, debounceMs, isHome, onSearchChange, onNavigateHome]);

  const handleClear = () => {
    setInputValue("");
    startTransition(() => {
      onSearchChange("");
    });
  };

  return (
    <div
      role="search"
      aria-label="Búsqueda rápida de módulos"
      className={cn("w-full max-w-md", className)}
    >
      <div className="relative flex items-center">
        <Search
          className="size-3.5 absolute left-3 text-muted-foreground pointer-events-none"
          strokeWidth={2}
          aria-hidden="true"
        />
        <Input
          type="text"
          placeholder="Buscar app o comando... (F1 Mesas, F2 POS, F3 KDS, F4 Caja)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          aria-label="Buscar aplicación o comando"
          className="pl-9 pr-8 py-1 bg-muted/50 border-border text-foreground text-xs focus-visible:ring-1 focus-visible:ring-primary h-8"
        />
        {inputValue.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
            className="absolute right-2.5 p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-3" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
};
