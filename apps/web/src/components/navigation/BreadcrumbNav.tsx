import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  LayoutGrid,
  CalendarDays,
  ShoppingBag,
  ChefHat,
  Utensils,
  Boxes,
  ReceiptText,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onBack: () => void;
  canGoBack: boolean;
  previousViewTitle?: string;
  className?: string;
}

interface ViewMeta {
  title: string;
  shortTitle: string;
  icon: LucideIcon;
}

const VIEW_METADATA: Record<string, ViewMeta> = {
  home: {
    title: "Aplicaciones",
    shortTitle: "Apps",
    icon: LayoutGrid,
  },
  salon: {
    title: "Salón y Mesas (F1)",
    shortTitle: "Salón",
    icon: LayoutGrid,
  },
  reservations: {
    title: "Reservas de Mesas",
    shortTitle: "Reservas",
    icon: CalendarDays,
  },
  pos: {
    title: "Punto de Venta (F2)",
    shortTitle: "POS",
    icon: ShoppingBag,
  },
  kds: {
    title: "Cocina KDS (F3)",
    shortTitle: "Cocina KDS",
    icon: ChefHat,
  },
  catalog: {
    title: "Menú y Catálogo",
    shortTitle: "Catálogo",
    icon: Utensils,
  },
  inventory: {
    title: "Inventario y Recetas",
    shortTitle: "Inventario",
    icon: Boxes,
  },
  shifts: {
    title: "Caja y Turnos (F4)",
    shortTitle: "Caja y Turnos",
    icon: ReceiptText,
  },
  reports: {
    title: "Reportes y Métricas",
    shortTitle: "Reportes",
    icon: BarChart3,
  },
  users: {
    title: "Gestión de Empleados & Roles",
    shortTitle: "Empleados",
    icon: Users,
  },
  settings: {
    title: "Ajustes y Personalización de Empresa",
    shortTitle: "Ajustes",
    icon: Settings,
  },
};

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  currentView,
  onNavigate,
  onBack,
  canGoBack,
  previousViewTitle,
  className,
}) => {
  const currentMeta: ViewMeta = VIEW_METADATA[currentView] || {
    title: currentView,
    shortTitle: currentView,
    icon: HelpCircle,
  };
  const CurrentIcon = currentMeta.icon;

  const backTooltip = previousViewTitle
    ? `Volver a ${previousViewTitle} [Esc o Alt+←]`
    : "Volver a la pantalla anterior [Esc o Alt+←]";

  return (
    <nav
      aria-label="Migas de pan y navegación de retorno"
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 min-w-0 border-l border-border/80 pl-2 sm:pl-3",
        className
      )}
    >
      {/* Botón Volver Atrás - Prioridad Táctil para DigitalPOS */}
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        title={backTooltip}
        aria-label={backTooltip}
        className={cn(
          "group relative inline-flex items-center justify-center gap-1.5",
          // Altura táctil ergonómica para dedos de operadores en terminales táctiles (38px)
          "h-9 px-3 rounded-xl font-bold text-xs sm:text-sm select-none transition-all duration-150 cursor-pointer shrink-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 active:scale-95",
          canGoBack
            ? "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 shadow-2xs hover:shadow-xs active:bg-primary/25"
            : "opacity-40 cursor-not-allowed bg-muted/40 border-border text-muted-foreground"
        )}
      >
        <ArrowLeft
          className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5"
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <span className="font-bold tracking-tight">Volver</span>
      </button>

      {/* Separador vertical sutil */}
      <div
        className="h-5 w-px bg-border/80 shrink-0 mx-0.5 hidden xs:block"
        aria-hidden="true"
      />

      {/* Migas de pan navegables */}
      <ol className="flex items-center gap-1 sm:gap-1.5 min-w-0 list-none p-0 m-0">
        {/* Nivel 1: Inicio / Apps */}
        <li className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            title="Ir al Menú Principal de Aplicaciones"
            aria-label="Ir a Aplicaciones"
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer select-none",
              "text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-transparent hover:border-border/60",
              "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            )}
          >
            <LayoutGrid
              className="size-3.5 text-muted-foreground/80 shrink-0"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Apps</span>
          </button>
        </li>

        {/* Separador Chevron */}
        <li
          className="flex items-center text-muted-foreground/50 shrink-0"
          aria-hidden="true"
        >
          <ChevronRight className="size-3.5" strokeWidth={2.2} />
        </li>

        {/* Nivel 2: Módulo Actual */}
        <li className="flex items-center min-w-0">
          <div
            aria-current="page"
            title={currentMeta.title}
            className={cn(
              "inline-flex items-center gap-2 h-9 px-3 rounded-xl text-xs sm:text-sm font-bold text-foreground",
              "bg-muted/70 border border-border/80 shadow-2xs select-none min-w-0"
            )}
          >
            <CurrentIcon
              className="size-4 text-primary shrink-0"
              strokeWidth={2.2}
              aria-hidden="true"
            />
            {/* Responsivo: título completo en pantallas grandes, título corto en pantallas compactas */}
            <span className="hidden xl:inline truncate max-w-[240px] 2xl:max-w-[360px]">
              {currentMeta.title}
            </span>
            <span className="inline xl:hidden truncate max-w-[120px] sm:max-w-[170px] lg:max-w-[220px]">
              {currentMeta.shortTitle}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );
};
