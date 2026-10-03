import React, { useState, useMemo } from 'react';
import { ReceiptText, CheckCircle2, Receipt, Eye, Search, ShoppingCart } from 'lucide-react';
import { PendingBill } from '../types/cash-shifts.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Props {
  pendingBills: PendingBill[];
  onSelectBill: (bill: PendingBill) => void;
  onViewDetails?: (bill: PendingBill) => void;
  onRefresh: () => void;
}

export const PendingBillsGrid: React.FC<Props> = ({
  pendingBills,
  onSelectBill,
  onViewDetails,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'all' | 'check_requested' | 'table' | 'takeout'>('all');
  const [search, setSearch] = useState('');

  const checkRequestedCount = useMemo(
    () => pendingBills.filter((b) => b.status === 'check_requested').length,
    [pendingBills]
  );
  const tablesCount = useMemo(
    () => pendingBills.filter((b) => Boolean(b.table)).length,
    [pendingBills]
  );
  const takeoutCount = useMemo(
    () => pendingBills.filter((b) => !b.table).length,
    [pendingBills]
  );

  const filteredBills = useMemo(() => {
    return pendingBills.filter((bill) => {
      // Type/Status filter
      if (filter === 'check_requested' && bill.status !== 'check_requested') return false;
      if (filter === 'table' && !bill.table) return false;
      if (filter === 'takeout' && bill.table) return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const dest = (bill.table?.label || bill.guestName || 'Para Llevar').toLowerCase();
        const waiter = (bill.waiter?.name || '').toLowerCase();
        const orderNum = (bill.orderNumber || bill.id).toString().toLowerCase();
        if (!dest.includes(q) && !waiter.includes(q) && !orderNum.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [pendingBills, filter, search]);

  return (
    <div className="w-full min-w-0 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm shadow-2xs p-4 sm:p-5 space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center space-x-2">
          <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ReceiptText className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
              Cuentas Pendientes de Cobro ({pendingBills.length})
            </h3>
            <span className="text-[11px] text-muted-foreground block">
              Comandas activas listas para pre-cuenta o cobro
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative flex-1 sm:w-44">
            <Search className="size-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar cuenta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-7 text-xs rounded-xl bg-muted/30 border-border/70 placeholder:text-muted-foreground/70"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onRefresh}
            className="h-8 text-xs px-2.5 py-1 rounded-xl shrink-0 cursor-pointer border-border/80 hover:bg-muted"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      {pendingBills.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                : 'bg-muted/30 text-muted-foreground hover:text-foreground border-border/70 hover:bg-muted'
            }`}
          >
            Todas ({pendingBills.length})
          </button>

          {checkRequestedCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter('check_requested')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                filter === 'check_requested'
                  ? 'bg-amber-500 text-black border-amber-500 shadow-2xs'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              Pidiendo Cuenta ({checkRequestedCount})
            </button>
          )}

          <button
            type="button"
            onClick={() => setFilter('table')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              filter === 'table'
                ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                : 'bg-muted/30 text-muted-foreground hover:text-foreground border-border/70 hover:bg-muted'
            }`}
          >
            Mesas ({tablesCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('takeout')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              filter === 'takeout'
                ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                : 'bg-muted/30 text-muted-foreground hover:text-foreground border-border/70 hover:bg-muted'
            }`}
          >
            Para Llevar ({takeoutCount})
          </button>
        </div>
      )}

      {/* Grid or Empty States */}
      <div>
        {pendingBills.length === 0 ? (
          <div className="p-8 bg-muted/15 rounded-2xl border border-dashed border-border/80 text-center text-muted-foreground text-xs space-y-3">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-1 ring-emerald-500/20">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">Salón al Día (Sin Cuentas Pendientes)</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                No hay comandas activas pendientes de cobro en mesas ni pedidos para llevar en este momento.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => { window.location.hash = '#/pos'; }}
              className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs active:scale-95"
            >
              <ShoppingCart className="size-3.5" />
              <span>Ir al POS a Facturar [F2]</span>
            </Button>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="p-6 bg-muted/15 rounded-2xl border border-dashed border-border/80 text-center text-muted-foreground text-xs space-y-2">
            <span>No se encontraron cuentas con el filtro seleccionado.</span>
            <div>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => { setFilter('all'); setSearch(''); }}
                className="text-xs text-primary font-bold hover:bg-primary/10"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full min-w-0 grid grid-cols-1 md:grid-cols-2 gap-3.5 auto-rows-fr">
            {filteredBills.map((bill) => {
              const isCheckRequested = bill.status === 'check_requested';
              const billTotalNum = parseFloat(bill.total || '0');
              const totalPaidNum = parseFloat(bill.totalPaid || '0');
              const pendingBalanceNum =
                bill.pendingBalance !== undefined
                  ? parseFloat(bill.pendingBalance)
                  : Math.max(0, billTotalNum - totalPaidNum);
              const hasPartialPayments = totalPaidNum > 0.009;

              const destinationLabel = bill.table
                ? bill.table.label
                : bill.guestName
                ? `Para Llevar (${bill.guestName})`
                : 'Para Llevar';

              return (
                <Card
                  key={bill.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all shadow-2xs ${
                    isCheckRequested
                      ? 'bg-amber-500/10 border-amber-500/70 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
                      : 'bg-card border-border/80 hover:border-primary/40'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-bold text-sm sm:text-base text-foreground truncate max-w-[65%]"
                        title={destinationLabel}
                      >
                        {destinationLabel}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {hasPartialPayments && (
                          <Badge
                            variant="outline"
                            className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold px-1.5"
                          >
                            Abonado
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isCheckRequested
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 animate-pulse'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {isCheckRequested ? 'Pide Cuenta' : bill.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>Orden #{bill.orderNumber || bill.id.slice(0, 6)}</span>
                      <span>{bill.waiter?.name || 'Mesero'}</span>
                    </div>

                    {bill.items && bill.items.length > 0 && (
                      <div className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/60 space-y-1">
                        {bill.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex justify-between truncate gap-2">
                            <span className="truncate">
                              {item.quantity}x {item.productName || item.product?.name || 'Ítem'}
                            </span>
                            <span className="font-mono text-foreground shrink-0 tabular-nums">
                              ${(parseFloat(item.unitPrice || '0') * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                        {bill.items.length > 3 && (
                          <p className="text-[10px] text-muted-foreground/80 italic pt-0.5">
                            +{bill.items.length - 3} ítem(s) más...
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <div>
                      {hasPartialPayments ? (
                        <div>
                          <span className="text-[9px] text-amber-600 dark:text-amber-400 block uppercase font-bold leading-tight">
                            Saldo:
                          </span>
                          <span className="text-base font-black text-primary font-mono tabular-nums leading-none">
                            ${pendingBalanceNum.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-muted-foreground block font-mono">
                            Tot: ${billTotalNum.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-muted-foreground block uppercase font-bold leading-tight">
                            Total:
                          </span>
                          <span className="text-base font-black text-primary font-mono tabular-nums">
                            ${billTotalNum.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onViewDetails && (
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => onViewDetails(bill)}
                          title="Ver Detalle de Cuenta"
                          className="px-2.5 py-1.5 h-8 rounded-xl text-xs font-semibold cursor-pointer border-border hover:bg-muted text-foreground"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline ml-1">Detalle</span>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        type="button"
                        onClick={() => onSelectBill(bill)}
                        className={`px-3 py-1.5 h-8 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs ${
                          isCheckRequested
                            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                        }`}
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Cobrar</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingBillsGrid;
