import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  AlertTriangle,
  ArrowDownRight,
  Boxes,
  Coins,
  Package,
  PackageX,
  CheckCircle2,
  Droplets,
  Scale,
  Download,
  Printer,
  History,
  X,
  ArrowUpDown,
  Filter,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface Props {
  items: InventoryItem[];
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenNewItemModal: () => void;
  onOpenMovementModal: (item: InventoryItem) => void;
  onViewMovements?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

type FilterStatus = 'all' | 'critical' | 'out_of_stock' | 'optimal';
type SortOption = 'stock_asc' | 'stock_desc' | 'name_asc' | 'value_desc';

const getItemVisual = (name: string, unit: string) => {
  const n = name.toLowerCase();
  const u = unit.toLowerCase();
  if (
    ['lt', 'ml', 'botella'].includes(u) ||
    n.includes('coca') ||
    n.includes('cerveza') ||
    n.includes('agua') ||
    n.includes('vino') ||
    n.includes('jugo') ||
    n.includes('leche') ||
    n.includes('gaseosa') ||
    n.includes('soda') ||
    n.includes('licor') ||
    n.includes('ron') ||
    n.includes('whisky') ||
    n.includes('vodka')
  ) {
    return {
      icon: Droplets,
      bg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
      category: 'Bebida / Líquido',
    };
  }
  if (
    ['kg', 'g', 'libra', 'oz'].includes(u) ||
    n.includes('carne') ||
    n.includes('pollo') ||
    n.includes('lomo') ||
    n.includes('queso') ||
    n.includes('harina') ||
    n.includes('papa') ||
    n.includes('arroz') ||
    n.includes('pescado') ||
    n.includes('verdura') ||
    n.includes('tomate') ||
    n.includes('cebolla')
  ) {
    return {
      icon: Scale,
      bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      category: 'Cocina / Perecedero',
    };
  }
  return {
    icon: Package,
    bg: 'bg-primary/15 text-primary border-primary/30',
    category: 'Abarrote / Unidad',
  };
};

export const StockTable: React.FC<Props> = ({
  items,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  onOpenNewItemModal,
  onOpenMovementModal,
  onViewMovements,
  onRefresh,
  isLoading = false,
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearch;
  const handleSearchChange = (val: string) => {
    if (externalOnSearchChange) {
      externalOnSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  // KPIs computed over ALL items
  const stats = useMemo(() => {
    let totalValue = 0;
    let criticalCount = 0;
    let outOfStockCount = 0;
    let optimalCount = 0;

    items.forEach((item) => {
      const stock = parseFloat(item.currentStock || '0');
      const cost = parseFloat(item.costPerUnit || '0');
      const threshold = parseFloat(item.alertThreshold || '0');

      totalValue += stock * cost;

      if (stock <= 0) {
        outOfStockCount++;
      } else if (stock <= threshold) {
        criticalCount++;
      } else {
        optimalCount++;
      }
    });

    const total = items.length;
    const healthPercent = total > 0 ? Math.round(((total - criticalCount - outOfStockCount) / total) * 100) : 100;

    return {
      total,
      totalValue,
      criticalCount,
      outOfStockCount,
      optimalCount,
      healthPercent,
    };
  }, [items]);

  // Unique units for dropdown
  const uniqueUnits = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.unit) set.add(it.unit.toLowerCase().trim());
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered & Sorted items
  const displayItems = useMemo(() => {
    let list = [...items];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.unit.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === 'critical') {
      list = list.filter((it) => {
        const s = parseFloat(it.currentStock || '0');
        const t = parseFloat(it.alertThreshold || '0');
        return s > 0 && s <= t;
      });
    } else if (statusFilter === 'out_of_stock') {
      list = list.filter((it) => parseFloat(it.currentStock || '0') <= 0);
    } else if (statusFilter === 'optimal') {
      list = list.filter((it) => {
        const s = parseFloat(it.currentStock || '0');
        const t = parseFloat(it.alertThreshold || '0');
        return s > t;
      });
    }

    // Unit filter
    if (unitFilter !== 'all') {
      list = list.filter((it) => it.unit.toLowerCase().trim() === unitFilter);
    }

    // Sorting
    list.sort((a, b) => {
      const stockA = parseFloat(a.currentStock || '0');
      const stockB = parseFloat(b.currentStock || '0');
      const valA = stockA * parseFloat(a.costPerUnit || '0');
      const valB = stockB * parseFloat(b.costPerUnit || '0');

      switch (sortBy) {
        case 'stock_asc':
          return stockA - stockB;
        case 'stock_desc':
          return stockB - stockA;
        case 'value_desc':
          return valB - valA;
        case 'name_asc':
        default:
          return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      }
    });

    return list;
  }, [items, searchQuery, statusFilter, unitFilter, sortBy]);

  // Export CSV function
  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ['Insumo', 'Unidad', 'Stock Actual', 'Umbral Alerta', 'Costo Unitario ($)', 'Valor Total ($)', 'Estado'];
    const rows = items.map((it) => {
      const s = parseFloat(it.currentStock || '0');
      const t = parseFloat(it.alertThreshold || '0');
      const c = parseFloat(it.costPerUnit || '0');
      const state = s <= 0 ? 'Agotado' : s <= t ? 'Stock Crítico' : 'Disponible';
      return [
        `"${it.name.replace(/"/g, '""')}"`,
        `"${it.unit}"`,
        s,
        t,
        c,
        s * c,
        state,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventario_stock_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print physical count sheet
  const handlePrintSheet = () => {
    window.print();
  };

  const isFilteringActive = searchQuery.trim() !== '' || statusFilter !== 'all' || unitFilter !== 'all';

  const resetFilters = () => {
    handleSearchChange('');
    setStatusFilter('all');
    setUnitFilter('all');
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Executive Stock Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Valuation */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs transition hover:border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Valor en Almacén
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              ${Math.round(stats.totalValue).toLocaleString('es-CO')}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Capital activo en existencias
            </p>
          </div>
        </div>

        {/* Total Insumos */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs transition hover:border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Insumos Registrados
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.total}{' '}
              <span className="text-sm font-semibold text-muted-foreground font-sans">
                {stats.total === 1 ? 'insumo' : 'insumos'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
              {stats.healthPercent}% en nivel óptimo
            </p>
          </div>
        </div>

        {/* Insumos Críticos / Bajo Umbral */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'critical' ? 'all' : 'critical')}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left transition cursor-pointer border ${
            statusFilter === 'critical'
              ? 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/30 shadow-sm'
              : 'bg-card border-border/80 hover:border-amber-500/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Stock Crítico
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.criticalCount}{' '}
              <span className="text-sm font-semibold text-muted-foreground font-sans">
                {stats.criticalCount === 1 ? 'alerta' : 'alertas'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
              {statusFilter === 'critical' ? 'Filtro activo (clic para ver todos)' : 'Por debajo del stock mínimo'}
            </p>
          </div>
        </button>

        {/* Agotados (Stock 0) */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'out_of_stock' ? 'all' : 'out_of_stock')}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left transition cursor-pointer border ${
            statusFilter === 'out_of_stock'
              ? 'bg-destructive/10 border-destructive/60 ring-2 ring-destructive/30 shadow-sm'
              : 'bg-card border-border/80 hover:border-destructive/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
              Agotados (Cero)
            </span>
            <div className="w-8 h-8 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive">
              <PackageX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.outOfStockCount}{' '}
              <span className="text-sm font-semibold text-muted-foreground font-sans">
                insumos
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive" />
              {stats.outOfStockCount > 0
                ? statusFilter === 'out_of_stock'
                  ? 'Filtro activo (clic para ver todos)'
                  : 'Bloquean preparación de platos'
                : 'Sin quiebres de existencias'}
            </p>
          </div>
        </button>
      </div>

      {/* 2. Main Card with Search, Filter Bar & Table */}
      <Card className="w-full min-w-0 shadow-sm border-border/80 rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/70 space-y-4">
          {/* Top Controls Row */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar insumo por nombre o unidad..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 h-10 rounded-xl text-xs bg-muted/30 border-border/80 focus:bg-background transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center flex-wrap gap-2">
              {onRefresh && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  title="Refrescar existencias"
                  className="h-10 px-3 rounded-xl text-xs font-semibold border-border/80 hover:bg-muted/50 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={items.length === 0}
                className="h-10 px-3.5 rounded-xl text-xs font-semibold border-border/80 hover:bg-muted/50 inline-flex items-center space-x-2 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrintSheet}
                disabled={items.length === 0}
                className="h-10 px-3.5 rounded-xl text-xs font-semibold border-border/80 hover:bg-muted/50 inline-flex items-center space-x-2 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">Planilla de Conteo</span>
              </Button>

              <Button
                type="button"
                onClick={onOpenNewItemModal}
                className="h-10 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25 inline-flex items-center space-x-2 transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Insumo</span>
              </Button>
            </div>
          </div>

          {/* Secondary Controls: Segmented Status Pills, Unit Filter & Sort */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-border/40">
            {/* Status Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
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
                onClick={() => setStatusFilter('critical')}
                className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap inline-flex items-center space-x-1.5 ${
                  statusFilter === 'critical'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span>Bajo Stock ({stats.criticalCount})</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('out_of_stock')}
                className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap inline-flex items-center space-x-1.5 ${
                  statusFilter === 'out_of_stock'
                    ? 'bg-destructive/20 text-destructive border border-destructive/40 hover:bg-destructive/30'
                    : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                }`}
              >
                <PackageX className="w-3 h-3 text-destructive" />
                <span>Agotados ({stats.outOfStockCount})</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('optimal')}
                className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap inline-flex items-center space-x-1.5 ${
                  statusFilter === 'optimal'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Óptimos ({stats.optimalCount})</span>
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

            {/* Dropdowns: Unit filter & Sort */}
            <div className="flex items-center space-x-2 shrink-0">
              {uniqueUnits.length > 0 && (
                <Select value={unitFilter} onValueChange={setUnitFilter}>
                  <SelectTrigger className="h-8 px-3 rounded-lg text-xs font-medium border-border/80 bg-muted/20 w-[140px]">
                    <SelectValue placeholder="Unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las unidades</SelectItem>
                    {uniqueUnits.map((u) => (
                      <SelectItem key={u} value={u}>
                        Unidad: {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                <SelectTrigger className="h-8 px-3 rounded-lg text-xs font-medium border-border/80 bg-muted/20 w-[170px]">
                  <ArrowUpDown className="w-3 h-3 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_asc">Nombre (A - Z)</SelectItem>
                  <SelectItem value="stock_asc">Menor stock primero</SelectItem>
                  <SelectItem value="stock_desc">Mayor stock primero</SelectItem>
                  <SelectItem value="value_desc">Mayor valor ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* 3. Table of Stock Items */}
        <CardContent className="p-0">
          <div className="w-full min-w-0 overflow-x-auto">
            <Table className="table-fixed w-full min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[30%] text-xs font-bold text-muted-foreground">Insumo & Categoría</TableHead>
                  <TableHead className="w-[12%] text-xs font-bold text-muted-foreground">Unidad</TableHead>
                  <TableHead className="w-[22%] text-xs font-bold text-muted-foreground">Nivel de Stock</TableHead>
                  <TableHead className="w-[18%] text-xs font-bold text-muted-foreground">Costo & Valor Total</TableHead>
                  <TableHead className="w-[12%] text-xs font-bold text-muted-foreground">Estado</TableHead>
                  <TableHead className="w-[16%] text-xs font-bold text-muted-foreground text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {displayItems.map((item) => {
                  const current = parseFloat(item.currentStock || '0');
                  const threshold = parseFloat(item.alertThreshold || '0');
                  const cost = parseFloat(item.costPerUnit || '0');
                  const totalRowValue = current * cost;

                  const isOutOfStock = current <= 0;
                  const isCritical = !isOutOfStock && current <= threshold;
                  const isCloseToAlert = !isOutOfStock && !isCritical && current <= threshold * 1.5;

                  // Ratio for stock health gauge (capped at 100%)
                  const targetSafe = Math.max(threshold * 2, 1);
                  const progressRatio = Math.min(100, Math.max(0, Math.round((current / targetSafe) * 100)));

                  const visual = getItemVisual(item.name, item.unit);
                  const VisualIcon = visual.icon;

                  const diffWithThreshold = current - threshold;

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Insumo */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${visual.bg}`}>
                            <VisualIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-sm text-foreground block truncate group-hover:text-primary transition-colors">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium block truncate">
                              Mínimo sugerido: {threshold} {item.unit}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Unidad */}
                      <TableCell className="py-3.5">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded-md uppercase bg-muted text-foreground/80 border border-border/60"
                        >
                          {item.unit}
                        </Badge>
                      </TableCell>

                      {/* Nivel de Stock con Barra de Salud */}
                      <TableCell className="py-3.5">
                        <div className="space-y-1.5 max-w-[190px]">
                          <div className="flex items-baseline justify-between">
                            <span className="font-mono font-black text-sm text-foreground">
                              {current.toLocaleString()}{' '}
                              <span className="text-[11px] font-sans font-semibold text-muted-foreground">
                                {item.unit}
                              </span>
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold ${
                                isOutOfStock
                                  ? 'text-destructive'
                                  : isCritical
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {isOutOfStock
                                ? 'Sin stock'
                                : diffWithThreshold >= 0
                                ? `+${diffWithThreshold.toLocaleString()} s/mín`
                                : `${diffWithThreshold.toLocaleString()} b/mín`}
                            </span>
                          </div>

                          {/* Progress Health Bar */}
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isOutOfStock
                                  ? 'bg-destructive w-0'
                                  : isCritical
                                  ? 'bg-amber-500'
                                  : isCloseToAlert
                                  ? 'bg-yellow-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${isOutOfStock ? 0 : Math.max(progressRatio, 8)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Costo Unitario & Valor Total */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-xs text-foreground">
                            ${cost.toLocaleString('es-CO')}{' '}
                            <span className="text-[10px] text-muted-foreground font-normal">
                              / {item.unit}
                            </span>
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground font-medium">
                            Total: ${Math.round(totalRowValue).toLocaleString('es-CO')}
                          </span>
                        </div>
                      </TableCell>

                      {/* Estado Operativo */}
                      <TableCell className="py-3.5">
                        {isOutOfStock ? (
                          <Badge
                            variant="destructive"
                            className="space-x-1 text-[10px] font-extrabold bg-destructive/15 text-destructive border border-destructive/30 px-2 py-0.5 rounded-lg whitespace-nowrap"
                          >
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                            <span>Agotado</span>
                          </Badge>
                        ) : isCritical ? (
                          <Badge
                            variant="destructive"
                            className="space-x-1 text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-lg whitespace-nowrap"
                          >
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Stock Crítico</span>
                          </Badge>
                        ) : isCloseToAlert ? (
                          <Badge
                            variant="outline"
                            className="space-x-1 text-[10px] font-extrabold bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-lg whitespace-nowrap"
                          >
                            <span>Por Agotar</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="space-x-1 text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-lg whitespace-nowrap"
                          >
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Disponible</span>
                          </Badge>
                        )}
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="py-3.5 text-right pr-6">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenMovementModal(item)}
                            className="h-8 px-2.5 rounded-lg text-xs font-bold border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 inline-flex items-center space-x-1 transition cursor-pointer"
                          >
                            <ArrowDownRight className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Ajustar</span>
                          </Button>

                          {onViewMovements && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={onViewMovements}
                              title="Ver historial de movimientos en Kardex"
                              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Empty filter results */}
                {displayItems.length === 0 && items.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-14 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                          <Filter className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-foreground">No se encontraron insumos</h4>
                        <p className="text-xs text-muted-foreground">
                          Ningún insumo coincide con los criterios de búsqueda o filtros activos.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={resetFilters}
                          className="mt-2 text-xs font-semibold rounded-xl"
                        >
                          Restablecer todos los filtros
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Completely empty inventory */}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 max-w-md mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <Sparkles className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-base text-foreground tracking-tight">
                            Comienza a registrar tu inventario
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Registra tus insumos base (carnes, bebidas, verduras, empaques) para calcular costos por plato en recetas y descontar existencias automáticamente con cada orden.
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={onOpenNewItemModal}
                          className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-primary/25 inline-flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Registrar Primer Insumo</span>
                        </Button>
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

export default StockTable;
