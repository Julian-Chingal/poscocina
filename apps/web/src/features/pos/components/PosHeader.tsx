import React from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  User,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { TableItem } from '../types/pos.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Props {
  currentTable: TableItem | null;
  allTables: TableItem[];
  isCashShiftOpen: boolean | null;
  waiterName?: string;
  guestName?: string;
  onSelectTable: (table: TableItem | null) => void;
  onGuestNameChange?: (name: string) => void;
  onNavigateToShifts?: () => void;
}

const TABLE_STATUS_CONFIG: Record<
  string,
  { label: string; dotClass: string; badgeVariant?: string }
> = {
  occupied: { label: 'Ocupada', dotClass: 'bg-amber-500' },
  paid_waiting_food: { label: 'Pagada (Cocina)', dotClass: 'bg-blue-500' },
  check_requested: { label: 'Pidiendo Cuenta', dotClass: 'bg-rose-500' },
  free: { label: 'Libre', dotClass: 'bg-emerald-500' },
};

const TAKEOUT_VALUE = '__takeout__';

export const PosHeader: React.FC<Props> = ({
  currentTable,
  allTables,
  isCashShiftOpen,
  waiterName,
  guestName = '',
  onSelectTable,
  onGuestNameChange,
  onNavigateToShifts,
}) => {
  const handleOpenShifts = () => {
    if (onNavigateToShifts) {
      onNavigateToShifts();
    } else {
      window.location.hash = '#/shifts';
    }
  };

  const currentStatusConfig = currentTable
    ? TABLE_STATUS_CONFIG[currentTable.status] || {
        label: 'Libre',
        dotClass: 'bg-emerald-500',
      }
    : null;

  return (
    <header className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-2xl p-2.5 sm:px-4 sm:py-3 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 transition-all">
      {/* Left side: Station and Diner info */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Table Selector Dropdown */}
        <div className="flex items-center gap-2 bg-muted/50 hover:bg-muted/70 transition-colors border border-border/70 rounded-xl px-2.5 py-1">
          {currentTable ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`size-2 rounded-full ${currentStatusConfig?.dotClass || 'bg-emerald-500'} ring-2 ring-background`}
                aria-hidden="true"
              />
              <Users className="w-3.5 h-3.5 text-primary" />
            </div>
          ) : (
            <ShoppingBag className="w-3.5 h-3.5 text-primary shrink-0" />
          )}

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">
              {currentTable ? 'Mesa' : 'Destino'}:
            </span>

            <Select
              value={currentTable?.id || TAKEOUT_VALUE}
              onValueChange={(value) => {
                if (value === TAKEOUT_VALUE) {
                  onSelectTable(null);
                } else {
                  const found = allTables.find((t) => t.id === value);
                  if (found) onSelectTable(found);
                }
              }}
            >
              <SelectTrigger className="h-7 text-xs font-bold border-none bg-transparent shadow-none focus:ring-0 px-1 w-auto min-w-[140px] text-foreground">
                <SelectValue placeholder="Para Llevar / Barra" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={TAKEOUT_VALUE} className="text-xs font-semibold py-2">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="size-3.5 text-primary" />
                    <span>Para Llevar / Sin Mesa</span>
                  </div>
                </SelectItem>
                <SelectSeparator />
                {allTables.map((t) => {
                  const statusInfo = TABLE_STATUS_CONFIG[t.status] || {
                    label: 'Libre',
                    dotClass: 'bg-emerald-500',
                  };
                  return (
                    <SelectItem key={t.id} value={t.id} className="text-xs py-1.5">
                      <div className="flex items-center justify-between w-full gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full shrink-0 ${statusInfo.dotClass}`}
                          />
                          <span className="font-bold">{t.label}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {statusInfo.label}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Guest Name Input for Takeout */}
        {!currentTable && onGuestNameChange && (
          <div className="flex items-center gap-1.5 bg-muted/40 border border-border/70 rounded-xl px-2.5 py-1 transition-all focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <Input
              type="text"
              placeholder="Referencia (ej. Carlos - Mostrador)"
              value={guestName}
              onChange={(e) => onGuestNameChange(e.target.value)}
              className="h-7 text-xs border-none bg-transparent shadow-none focus-visible:ring-0 px-1 w-44 sm:w-56 text-foreground placeholder:text-muted-foreground/70"
            />
            {guestName && (
              <button
                type="button"
                onClick={() => onGuestNameChange('')}
                className="text-[10px] text-muted-foreground hover:text-foreground px-1 py-0.5 rounded cursor-pointer"
                title="Limpiar nombre"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Current Table Active Pill */}
        {currentTable && (
          <Badge
            variant="secondary"
            className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5"
          >
            <Sparkles className="size-3" />
            <span>Mesa {currentTable.label} activa</span>
          </Badge>
        )}
      </div>

      {/* Right side: Waiter badge and Cash Shift Status */}
      <div className="flex items-center justify-between md:justify-end gap-2.5">
        {waiterName && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-muted/40 border border-border/60 text-xs">
            <span className="size-2 rounded-full bg-primary/60 shrink-0" />
            <span className="text-muted-foreground font-medium text-[11px]">
              Atiende: <strong className="text-foreground font-semibold">{waiterName}</strong>
            </span>
          </div>
        )}

        {/* Cash Shift Status Button/Badge */}
        {isCashShiftOpen === false ? (
          <button
            type="button"
            onClick={handleOpenShifts}
            title="Haz clic para abrir el turno de caja o presiona F4"
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <AlertTriangle className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0 group-hover:animate-bounce" />
            <span>Caja Cerrada · Abrir Turno [F4]</span>
            <ArrowRight className="size-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : isCashShiftOpen === true ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold shadow-2xs">
            <span className="relative flex size-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
            </span>
            <CheckCircle2 className="size-3.5 hidden" />
            <span>Caja Operativa</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 text-muted-foreground text-xs font-medium">
            <span className="size-2 rounded-full bg-muted-foreground/40 animate-pulse" />
            <span>Verificando caja...</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default PosHeader;
