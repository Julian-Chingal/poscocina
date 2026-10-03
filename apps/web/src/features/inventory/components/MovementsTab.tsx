import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  History,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  SlidersHorizontal,
  Search,
  X,
  Download,
  Calendar,
  AlertCircle,
  Package,
} from 'lucide-react';
import { InventoryMovement } from '../types/inventory.types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface Props {
  movements: InventoryMovement[];
}

type MovementFilterType = 'all' | 'purchase' | 'sale' | 'waste' | 'adjustment';

export const MovementsTab: React.FC<Props> = ({ movements }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MovementFilterType>('all');

  // KPI Metrics
  const stats = useMemo(() => {
    let entriesCount = 0;
    let salesCount = 0;
    let wasteCount = 0;
    let adjustmentCount = 0;

    movements.forEach((m) => {
      const movType = (m.movementType || m.type || '').toLowerCase();
      if (movType === 'purchase') {
        entriesCount++;
      } else if (movType === 'sale' || movType === 'order_consumed' || movType === 'sale_deduction') {
        salesCount++;
      } else if (movType === 'waste') {
        wasteCount++;
      } else {
        adjustmentCount++;
      }
    });

    return {
      total: movements.length,
      entriesCount,
      salesCount,
      wasteCount,
      adjustmentCount,
    };
  }, [movements]);

  // Filtered movements
  const filteredMovements = useMemo(() => {
    let list = [...movements];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((m) => {
        const name = (m.inventoryItem?.name || m.itemName || m.inventoryItemId || '').toLowerCase();
        const note = (m.notes || '').toLowerCase();
        return name.includes(q) || note.includes(q);
      });
    }

    if (filterType !== 'all') {
      list = list.filter((m) => {
        const movType = (m.movementType || m.type || '').toLowerCase();
        if (filterType === 'sale') {
          return movType === 'sale' || movType === 'order_consumed' || movType === 'sale_deduction';
        }
        if (filterType === 'purchase') {
          return movType === 'purchase';
        }
        if (filterType === 'waste') {
          return movType === 'waste';
        }
        if (filterType === 'adjustment') {
          return movType === 'adjustment' || (movType !== 'sale' && movType !== 'purchase' && movType !== 'waste');
        }
        return true;
      });
    }

    // Default newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list;
  }, [movements, searchQuery, filterType]);

  // Export Kardex CSV
  const handleExportCSV = () => {
    if (movements.length === 0) return;
    const headers = ['Fecha y Hora', 'Tipo', 'Insumo', 'Unidad', 'Cantidad', 'Motivo / Origen'];
    const rows = movements.map((m) => {
      const movType = (m.movementType || m.type || '').toLowerCase();
      const isSale = movType === 'sale' || movType === 'order_consumed' || movType === 'sale_deduction';
      const rawQty = parseFloat(m.quantity) || 0;
      const signedQty = isSale ? -Math.abs(rawQty) : rawQty;
      const insumoName = m.inventoryItem?.name || m.itemName || m.inventoryItemId || 'Insumo';
      const insumoUnit = m.inventoryItem?.unit || m.unit || '';

      return [
        `"${new Date(m.createdAt).toLocaleString()}"`,
        `"${movType}"`,
        `"${insumoName.replace(/"/g, '""')}"`,
        `"${insumoUnit}"`,
        signedQty,
        `"${(m.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kardex_movimientos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isFilteringActive = searchQuery.trim() !== '' || filterType !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('all');
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* 1. Kardex Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Movimientos */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Registros Kardex
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.total}{' '}
              <span className="text-sm font-semibold text-muted-foreground font-sans">
                {stats.total === 1 ? 'evento' : 'eventos'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
              Trazabilidad total auditada
            </p>
          </div>
        </div>

        {/* Entradas (+) */}
        <button
          type="button"
          onClick={() => setFilterType(filterType === 'purchase' ? 'all' : 'purchase')}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left transition cursor-pointer border ${
            filterType === 'purchase'
              ? 'bg-emerald-500/10 border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-sm'
              : 'bg-card border-border/80 hover:border-emerald-500/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Entradas (+ Compras)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.entriesCount}{' '}
              <span className="text-sm font-semibold text-muted-foreground font-sans">
                ingresos
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {filterType === 'purchase' ? 'Filtro activo' : 'Abonos de compras y ajustes'}
            </p>
          </div>
        </button>

        {/* Ventas POS */}
        <button
          type="button"
          onClick={() => setFilterType(filterType === 'sale' ? 'all' : 'sale')}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left transition cursor-pointer border ${
            filterType === 'sale'
              ? 'bg-sky-500/10 border-sky-500/60 ring-2 ring-sky-500/30 shadow-sm'
              : 'bg-card border-border/80 hover:border-sky-500/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
              Consumo por Ventas
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.salesCount}{' '}
              <span className="text-sm font-semibold text-muted-foreground font-sans">
                deducciones
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500" />
              {filterType === 'sale' ? 'Filtro activo' : 'Descuento automático por comanda'}
            </p>
          </div>
        </button>

        {/* Mermas (-) */}
        <button
          type="button"
          onClick={() => setFilterType(filterType === 'waste' ? 'all' : 'waste')}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left transition cursor-pointer border ${
            filterType === 'waste'
              ? 'bg-destructive/10 border-destructive/60 ring-2 ring-destructive/30 shadow-sm'
              : 'bg-card border-border/80 hover:border-destructive/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
              Mermas & Desperdicio
            </span>
            <div className="w-8 h-8 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.wasteCount}{' '}
              <span className="text-sm font-semibold text-muted-foreground font-sans">
                bajas
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive" />
              {filterType === 'waste' ? 'Filtro activo' : 'Bajas por daño o caducidad'}
            </p>
          </div>
        </button>
      </div>

      {/* 2. Main Card with Controls & Kardex Table */}
      <Card className="w-full min-w-0 shadow-sm border-border/80 rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/70 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar movimiento por insumo u observaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 h-10 rounded-xl text-xs bg-muted/30 border-border/80 focus:bg-background transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Export Action */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={movements.length === 0}
              className="h-10 px-3.5 rounded-xl text-xs font-bold border-border/80 hover:bg-muted/60 inline-flex items-center space-x-2 transition cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Exportar Kardex CSV</span>
            </Button>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilterType('all')}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-foreground text-background hover:bg-foreground/90'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              Todos ({stats.total})
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilterType('purchase')}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap inline-flex items-center space-x-1.5 ${
                filterType === 'purchase'
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10'
              }`}
            >
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>Entradas ({stats.entriesCount})</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilterType('sale')}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap inline-flex items-center space-x-1.5 ${
                filterType === 'sale'
                  ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
                  : 'text-muted-foreground hover:text-sky-600 hover:bg-sky-500/10'
              }`}
            >
              <ShoppingCart className="w-3 h-3 text-sky-500" />
              <span>Ventas POS ({stats.salesCount})</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilterType('waste')}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap inline-flex items-center space-x-1.5 ${
                filterType === 'waste'
                  ? 'bg-destructive/20 text-destructive border border-destructive/40 hover:bg-destructive/30'
                  : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
              }`}
            >
              <TrendingDown className="w-3 h-3 text-destructive" />
              <span>Mermas ({stats.wasteCount})</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilterType('adjustment')}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap inline-flex items-center space-x-1.5 ${
                filterType === 'adjustment'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3 text-amber-500" />
              <span>Ajustes ({stats.adjustmentCount})</span>
            </Button>

            {isFilteringActive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 px-2.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex items-center space-x-1 transition cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Limpiar</span>
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Table Content */}
        <CardContent className="p-0">
          <div className="w-full min-w-0 overflow-x-auto">
            <Table className="table-fixed w-full min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[18%] text-xs font-bold text-muted-foreground">Fecha y Hora</TableHead>
                  <TableHead className="w-[18%] text-xs font-bold text-muted-foreground">Tipo de Movimiento</TableHead>
                  <TableHead className="w-[28%] text-xs font-bold text-muted-foreground">Insumo Afectado</TableHead>
                  <TableHead className="w-[16%] text-xs font-bold text-muted-foreground">Cantidad Neta</TableHead>
                  <TableHead className="w-[20%] text-xs font-bold text-muted-foreground">Motivo / Trazabilidad</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredMovements.map((m) => {
                  const movType = (m.movementType || m.type || '').toLowerCase();
                  const isSale = movType === 'sale' || movType === 'order_consumed' || movType === 'sale_deduction';
                  const isPurchase = movType === 'purchase';
                  const isWaste = movType === 'waste';
                  const rawQty = parseFloat(m.quantity) || 0;
                  const isNegative = rawQty < 0 || isSale || isWaste;
                  const absQty = Math.abs(rawQty);

                  const insumoName = m.inventoryItem?.name || m.itemName || m.inventoryItemId || 'Insumo';
                  const insumoUnit = m.inventoryItem?.unit || m.unit || '';
                  const dateObj = new Date(m.createdAt);

                  return (
                    <TableRow key={m.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Fecha y Hora */}
                      <TableCell className="py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-semibold text-foreground block">
                            {dateObj.toLocaleDateString()}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground/70" />
                            {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Tipo */}
                      <TableCell className="py-3.5">
                        {isSale ? (
                          <Badge
                            variant="outline"
                            className="space-x-1 text-[10px] font-extrabold text-sky-700 dark:text-sky-400 bg-sky-500/15 border-sky-500/30 px-2 py-0.5 rounded-lg whitespace-nowrap"
                          >
                            <ShoppingCart className="w-3 h-3 text-sky-500 shrink-0" />
                            <span>Venta (POS)</span>
                          </Badge>
                        ) : isPurchase ? (
                          <Badge
                            variant="outline"
                            className="space-x-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30 px-2 py-0.5 rounded-lg whitespace-nowrap"
                          >
                            <ArrowDownRight className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>Entrada / Compra</span>
                          </Badge>
                        ) : isWaste ? (
                          <Badge
                            variant="outline"
                            className="space-x-1 text-[10px] font-extrabold text-destructive bg-destructive/15 border-destructive/30 px-2 py-0.5 rounded-lg whitespace-nowrap"
                          >
                            <ArrowUpRight className="w-3 h-3 text-destructive shrink-0" />
                            <span>Merma / Baja</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="space-x-1 text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-500/15 border-amber-500/30 px-2 py-0.5 rounded-lg whitespace-nowrap"
                          >
                            <SlidersHorizontal className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Ajuste Conteo</span>
                          </Badge>
                        )}
                      </TableCell>

                      {/* Insumo */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-muted border border-border/80 flex items-center justify-center text-muted-foreground shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-xs text-foreground block truncate group-hover:text-primary transition-colors">
                              {insumoName}
                            </span>
                            {insumoUnit && (
                              <span className="text-[10px] text-muted-foreground font-mono uppercase">
                                Unidad: {insumoUnit}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Cantidad Neta */}
                      <TableCell className="py-3.5">
                        <span
                          className={`font-mono font-black text-sm ${
                            isNegative
                              ? 'text-destructive'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isNegative ? '-' : '+'}
                          {absQty.toLocaleString()} {insumoUnit}
                        </span>
                      </TableCell>

                      {/* Motivo / Trazabilidad */}
                      <TableCell className="py-3.5">
                        <span className="text-xs text-muted-foreground block truncate" title={m.notes || ''}>
                          {m.notes || 'Operación registrada en sistema'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Filter Empty State */}
                {filteredMovements.length === 0 && movements.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-foreground">No se encontraron movimientos</h4>
                        <p className="text-xs text-muted-foreground">
                          No hay registros que coincidan con la búsqueda o filtro aplicado.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={resetFilters}
                          className="mt-2 text-xs font-semibold rounded-xl"
                        >
                          Restablecer filtros
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Completely Empty State */}
                {movements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 max-w-md mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <History className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-base text-foreground tracking-tight">
                            Kardex sin movimientos aún
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Aquí se auditarán automáticamente todas las recepciones de facturas de compra, mermas de cocina, ajustes de conteo y deducciones automáticas por venta de platos.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MovementsTab;
