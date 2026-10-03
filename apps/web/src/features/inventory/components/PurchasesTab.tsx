import React, { useState, useMemo } from 'react';
import {
  Receipt,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  Search,
  X,
  Truck,
  DollarSign,
  AlertCircle,
  Calendar,
  Building2,
  PackageCheck,
} from 'lucide-react';
import { Purchase } from '../types/inventory.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  purchases: Purchase[];
  onOpenNewPurchase: () => void;
  onSelectPurchaseDetail: (purchase: Purchase) => void;
  onReceivePurchase: (purchaseId: string) => void;
}

type PurchaseStatusFilter = 'all' | 'draft' | 'received' | 'cancelled';

export const PurchasesTab: React.FC<Props> = ({
  purchases,
  onOpenNewPurchase,
  onSelectPurchaseDetail,
  onReceivePurchase,
}) => {
  const [purchaseToReceive, setPurchaseToReceive] = useState<Purchase | null>(null);
  const [isReceiving, setIsReceiving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseStatusFilter>('all');

  const handleConfirmReceive = async () => {
    if (!purchaseToReceive) return;
    setIsReceiving(true);
    try {
      await onReceivePurchase(purchaseToReceive.id);
      setPurchaseToReceive(null);
    } finally {
      setIsReceiving(false);
    }
  };

  // KPIs
  const stats = useMemo(() => {
    let totalSpent = 0;
    let draftCount = 0;
    let receivedCount = 0;
    let cancelledCount = 0;

    purchases.forEach((p) => {
      const amt = parseFloat(p.totalAmount || '0');
      if (p.status === 'received') {
        totalSpent += amt;
        receivedCount++;
      } else if (p.status === 'draft') {
        draftCount++;
      } else if (p.status === 'cancelled') {
        cancelledCount++;
      }
    });

    return {
      total: purchases.length,
      totalSpent,
      draftCount,
      receivedCount,
      cancelledCount,
    };
  }, [purchases]);

  // Filtered purchases
  const filteredPurchases = useMemo(() => {
    let list = [...purchases];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const inv = (p.invoiceNumber || '').toLowerCase();
        const sup = (p.supplier?.name || '').toLowerCase();
        const doc = (p.supplier?.documentNumber || '').toLowerCase();
        return inv.includes(q) || sup.includes(q) || doc.includes(q);
      });
    }

    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }

    // Default newest first
    list.sort((a, b) => {
      const dateA = new Date(a.purchaseDate || a.createdAt).getTime();
      const dateB = new Date(b.purchaseDate || b.createdAt).getTime();
      return dateB - dateA;
    });

    return list;
  }, [purchases, searchQuery, statusFilter]);

  const isFilteringActive = searchQuery.trim() !== '' || statusFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* 1. Executive Purchases KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Invertido */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Compras Recibidas
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              ${Math.round(stats.totalSpent).toLocaleString('es-CO')}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Facturas procesadas e ingresadas
            </p>
          </div>
        </div>

        {/* Facturas Registradas */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Facturas
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.total}{' '}
              <span className="text-sm font-semibold text-muted-foreground font-sans">
                {stats.total === 1 ? 'factura' : 'facturas'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
              Historial de órdenes de compra
            </p>
          </div>
        </div>

        {/* Facturas Pendientes (Borrador) */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'draft' ? 'all' : 'draft')}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left transition cursor-pointer border ${
            statusFilter === 'draft'
              ? 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/30 shadow-sm'
              : 'bg-card border-border/80 hover:border-amber-500/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Pendientes Recibir
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.draftCount}{' '}
              <span className="text-sm font-semibold text-muted-foreground font-sans">
                {stats.draftCount === 1 ? 'pendiente' : 'pendientes'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
              {statusFilter === 'draft' ? 'Filtro activo' : 'Pendientes de verificar en almacén'}
            </p>
          </div>
        </button>

        {/* Recibidas */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'received' ? 'all' : 'received')}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left transition cursor-pointer border ${
            statusFilter === 'received'
              ? 'bg-emerald-500/10 border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-sm'
              : 'bg-card border-border/80 hover:border-emerald-500/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              En Almacén
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {stats.receivedCount}{' '}
              <span className="text-sm font-semibold text-muted-foreground font-sans">
                recibidas
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Stock ya incorporado al inventario
            </p>
          </div>
        </button>
      </div>

      {/* 2. Main Card with Controls & Purchases Table */}
      <Card className="w-full min-w-0 shadow-sm border-border/80 rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/70 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por factura, proveedor o NIT..."
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

            {/* Primary Action */}
            <Button
              type="button"
              onClick={onOpenNewPurchase}
              className="h-10 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25 inline-flex items-center space-x-2 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Factura de Compra</span>
            </Button>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-border/40">
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
              Todas ({stats.total})
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('draft')}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap inline-flex items-center space-x-1.5 ${
                statusFilter === 'draft'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Pendientes ({stats.draftCount})</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('received')}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap inline-flex items-center space-x-1.5 ${
                statusFilter === 'received'
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10'
              }`}
            >
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span>Recibidas ({stats.receivedCount})</span>
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
                  <TableHead className="w-[22%] text-xs font-bold text-muted-foreground">Factura / Remisión</TableHead>
                  <TableHead className="w-[28%] text-xs font-bold text-muted-foreground">Proveedor & NIT</TableHead>
                  <TableHead className="w-[15%] text-xs font-bold text-muted-foreground">Fecha Emisión</TableHead>
                  <TableHead className="w-[15%] text-xs font-bold text-muted-foreground">Total Factura</TableHead>
                  <TableHead className="w-[12%] text-xs font-bold text-muted-foreground">Estado</TableHead>
                  <TableHead className="w-[16%] text-xs font-bold text-muted-foreground text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredPurchases.map((purchase) => {
                  const total = parseFloat(purchase.totalAmount || '0');
                  const dateObj = new Date(purchase.purchaseDate || purchase.createdAt);

                  return (
                    <TableRow key={purchase.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Factura */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-sm text-foreground block truncate group-hover:text-primary transition-colors">
                              {purchase.invoiceNumber}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono block truncate">
                              ID: {purchase.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Proveedor */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-foreground block truncate">
                              {purchase.supplier?.name || 'Proveedor general'}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono block truncate">
                              {purchase.supplier?.documentType || 'NIT'}: {purchase.supplier?.documentNumber || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Fecha */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
                          <span>{dateObj.toLocaleDateString()}</span>
                        </div>
                      </TableCell>

                      {/* Total */}
                      <TableCell className="py-3.5">
                        <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                          ${Math.round(total).toLocaleString('es-CO')}
                        </span>
                      </TableCell>

                      {/* Estado */}
                      <TableCell className="py-3.5">
                        {purchase.status === 'received' ? (
                          <Badge
                            variant="outline"
                            className="space-x-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30 px-2 py-0.5 rounded-lg whitespace-nowrap"
                          >
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Recibida</span>
                          </Badge>
                        ) : purchase.status === 'draft' ? (
                          <Badge
                            variant="outline"
                            className="space-x-1 text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-500/15 border-amber-500/30 px-2 py-0.5 rounded-lg whitespace-nowrap"
                          >
                            <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Pendiente</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="space-x-1 text-[10px] font-extrabold text-destructive bg-destructive/15 border-destructive/30 px-2 py-0.5 rounded-lg whitespace-nowrap"
                          >
                            <span>Cancelada</span>
                          </Badge>
                        )}
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="py-3.5 text-right pr-6">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectPurchaseDetail(purchase)}
                            className="h-8 px-2.5 rounded-lg text-xs font-bold border-border/80 hover:bg-muted/80 inline-flex items-center space-x-1 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Líneas</span>
                          </Button>

                          {purchase.status === 'draft' && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setPurchaseToReceive(purchase)}
                              className="h-8 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs shadow-emerald-600/20 inline-flex items-center space-x-1 transition cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Recibir</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Empty filter results */}
                {filteredPurchases.length === 0 && purchases.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-foreground">No se encontraron facturas</h4>
                        <p className="text-xs text-muted-foreground">
                          No hay facturas que coincidan con la búsqueda o filtro aplicado.
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

                {/* Completely empty purchases */}
                {purchases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 max-w-md mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <Receipt className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-base text-foreground tracking-tight">
                            Registra tus facturas de compra
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Ingresa las compras de tus proveedores para alimentar el stock de bodega, calcular el Costo Promedio Ponderado (CPP) y mantener cuentas claras.
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={onOpenNewPurchase}
                          className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-primary/25 inline-flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Crear Primera Factura</span>
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

      {/* Confirmation Modal to Receive Stock */}
      <AlertDialog open={Boolean(purchaseToReceive)} onOpenChange={(open) => !open && setPurchaseToReceive(null)}>
        <AlertDialogContent className="max-w-md rounded-2xl">
          <AlertDialogHeader className="text-center sm:text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <PackageCheck className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-base font-extrabold text-foreground">
              ¿Confirmar Recepción de Factura?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              ¿Confirmas la recepción física de la factura <span className="text-foreground font-bold font-mono">"{purchaseToReceive?.invoiceNumber}"</span> de <span className="text-foreground font-bold">{purchaseToReceive?.supplier?.name}</span>? Se ingresará el stock de cada insumo y se recalculará el costo ponderado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center sm:justify-center mt-3 gap-2">
            <AlertDialogCancel disabled={isReceiving} onClick={() => setPurchaseToReceive(null)} className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isReceiving}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmReceive();
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-4"
            >
              {isReceiving ? 'Ingresando Stock...' : 'Confirmar e Ingresar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PurchasesTab;
