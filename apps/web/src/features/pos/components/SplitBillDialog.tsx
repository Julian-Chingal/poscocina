import React from 'react';
import {
  Sparkles,
  Receipt,
  Users,
  Divide,
  Plus,
  Tag,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSplitBill } from '../hooks/useSplitBill';
import { SplitPartCard } from './SplitPartCard';
import { SplitBillSummaryCard } from './SplitBillSummaryCard';
import { ItemsSelectionList } from './ItemsSelectionList';
import { Customer } from '../types/pos.types';

export interface SplitBillDialogProps {
  isOpen: boolean;
  order: any;
  customer?: Customer | null;
  venueId: string;
  onClose: () => void;
  onSuccess?: (receipt: any) => void;
}

export const SplitBillDialog: React.FC<SplitBillDialogProps> = ({
  isOpen,
  order,
  customer,
  venueId,
  onClose,
  onSuccess,
}) => {
  const {
    splitMode,
    equalCount,
    parts,
    selectedItemIds,
    applyDiscount,
    discountType,
    discountValue,
    discountReason,
    tipPct,
    isSubmitting,
    apiError,
    summary,
    setSplitMode,
    setEqualCount,
    addCustomPart,
    removeCustomPart,
    updatePartName,
    updatePartTargetAmount,
    addPaymentLine,
    updatePaymentLine,
    removePaymentLine,
    setExactCashTendered,
    toggleItemSelection,
    selectAllItems,
    clearItemSelection,
    setApplyDiscount,
    setDiscountType,
    setDiscountValue,
    setDiscountReason,
    setTipPct,
    processSplitPayment,
  } = useSplitBill({
    order,
    venueId,
    customerId: customer?.id,
    onSuccess: (receipt) => {
      onSuccess?.(receipt);
      onClose();
    },
  });

  if (!isOpen || !order) return null;

  const totalPaid = parseFloat(order?.totalPaid || '0');
  const hasPriorPayments = totalPaid > 0.009;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent maxWidth="2xl" onClose={onClose} className="max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border/80 bg-background shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-orange-500 uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>Facturación y División de Cuenta</span>
            </div>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-black text-foreground mt-1">
            {hasPriorPayments ? 'Cobro de Saldo Pendiente' : 'Cobro de Comanda con Pagos Mixtos'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Orden #{order.orderNumber || order.id?.slice(0, 8)}
            {order.table?.name && ` • Mesa: ${order.table.name}`}
            {customer && ` • Cliente: ${customer.name}`}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          {/* Alerta de Error de Fastify API */}
          {apiError && (
            <Alert variant="destructive" className="py-2.5">
              <AlertTriangle className="size-4" />
              <AlertTitle className="text-xs font-bold">Error en la transacción</AlertTitle>
              <AlertDescription className="text-xs mt-0.5">{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Selector de Modo de División (shadcn Buttons) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Divide className="size-3.5 text-primary" />
              <span>Modalidad de Cobro / División:</span>
            </Label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60">
              <Button
                type="button"
                size="sm"
                variant={splitMode === 'single' ? 'default' : 'ghost'}
                onClick={() => setSplitMode('single')}
                className={`h-8 text-xs font-semibold rounded-lg ${
                  splitMode === 'single'
                    ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Cuenta Completa
              </Button>

              <Button
                type="button"
                size="sm"
                variant={splitMode === 'equal' ? 'default' : 'ghost'}
                onClick={() => setSplitMode('equal')}
                className={`h-8 text-xs font-semibold rounded-lg ${
                  splitMode === 'equal'
                    ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Partes Iguales
              </Button>

              <Button
                type="button"
                size="sm"
                variant={splitMode === 'custom' ? 'default' : 'ghost'}
                onClick={() => setSplitMode('custom')}
                className={`h-8 text-xs font-semibold rounded-lg ${
                  splitMode === 'custom'
                    ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monto Manual
              </Button>

              <Button
                type="button"
                size="sm"
                variant={splitMode === 'items' ? 'default' : 'ghost'}
                onClick={() => setSplitMode('items')}
                className={`h-8 text-xs font-semibold rounded-lg ${
                  splitMode === 'items'
                    ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Por Ítems
              </Button>
            </div>
          </div>

          {/* Opciones contextuales según el modo seleccionado */}
          {splitMode === 'equal' && (
            <div className="p-3 bg-muted/30 border border-border/70 rounded-xl flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-primary" />
                <span>Dividir en cuántas partes:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {[2, 3, 4, 5, 6, 8].map((cnt) => (
                  <Button
                    key={cnt}
                    type="button"
                    size="sm"
                    variant={equalCount === cnt ? 'default' : 'secondary'}
                    onClick={() => setEqualCount(cnt)}
                    className={`size-7 p-0 rounded-md font-mono text-xs font-bold ${
                      equalCount === cnt
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'bg-background hover:bg-muted text-foreground'
                    }`}
                  >
                    {cnt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {splitMode === 'custom' && (
            <div className="flex items-center justify-between p-2.5 bg-muted/20 border border-border/70 rounded-xl">
              <span className="text-xs text-muted-foreground">
                Asigna el monto a pagar manualmente para cada comensal o persona.
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addCustomPart}
                className="h-7 text-xs font-semibold gap-1 text-primary border-primary/40 hover:bg-primary/10"
              >
                <Plus className="size-3.5" />
                <span>Agregar Persona</span>
              </Button>
            </div>
          )}

          {splitMode === 'items' && (
            <ItemsSelectionList
              items={order.items || []}
              selectedItemIds={selectedItemIds}
              onToggleItem={toggleItemSelection}
              onSelectAll={selectAllItems}
              onClearAll={clearItemSelection}
            />
          )}

          {/* Sección de Descuentos Especiales y Propina */}
          <div className="pt-2 border-t border-border/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="split-apply-discount"
                  checked={applyDiscount}
                  onCheckedChange={setApplyDiscount}
                />
                <Label
                  htmlFor="split-apply-discount"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer"
                >
                  <Tag className="size-3 text-primary" />
                  <span>Aplicar Descuento a la Orden</span>
                </Label>
              </div>

              {/* Selector Rápido de Propina */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">Propina:</span>
                {[0, 5, 10, 15].map((pct) => (
                  <Button
                    key={pct}
                    type="button"
                    size="sm"
                    variant={tipPct === pct ? 'default' : 'outline'}
                    onClick={() => setTipPct(pct)}
                    className={`h-6 px-2 text-[10px] font-mono rounded-md ${
                      tipPct === pct
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
            </div>

            {applyDiscount && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-muted/30 border border-border/70 rounded-xl">
                <div>
                  <Label className="text-[10px] text-muted-foreground block mb-1">Tipo:</Label>
                  <Select
                    value={discountType}
                    onValueChange={(val) => setDiscountType(val as 'percent' | 'fixed')}
                  >
                    <SelectTrigger className="h-8 text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent" className="text-xs">Porcentaje (%)</SelectItem>
                      <SelectItem value="fixed" className="text-xs">Monto Fijo ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground block mb-1">Valor:</Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="h-8 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground block mb-1">Motivo / Razón:</Label>
                  <Input
                    type="text"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="ej. Cortesía, Cliente Frecuente"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Resumen Financiero en Tiempo Real con shadcn Card + Badge */}
          <SplitBillSummaryCard
            orderTotal={summary.orderTotal}
            totalCovered={summary.totalCovered}
            remainingBalance={summary.remainingBalance}
            discountTotal={summary.discountTotal}
            tipTotal={summary.tipTotal}
          />

          {/* Lista de Partes / Personas con sus Métodos de Pago Mixtos */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                Desglose de Pagos por Parte ({parts.length})
              </span>
              <span className="text-[11px] text-muted-foreground">
                Cada parte puede combinar Efectivo, Tarjeta, Transferencia, etc.
              </span>
            </div>

            {parts.map((part, index) => (
              <SplitPartCard
                key={part.id}
                part={part}
                index={index}
                splitMode={splitMode}
                canRemovePart={parts.length > 1 && splitMode === 'custom'}
                onUpdatePartName={updatePartName}
                onUpdatePartTarget={updatePartTargetAmount}
                onRemovePart={removeCustomPart}
                onAddPaymentLine={addPaymentLine}
                onUpdatePaymentLine={updatePaymentLine}
                onRemovePaymentLine={removePaymentLine}
                onSetExactCash={setExactCashTendered}
              />
            ))}
          </div>
        </div>

        {/* Footer con Validaciones y Botón Principal */}
        <DialogFooter className="p-4 sm:p-5 border-t border-border/80 bg-background shrink-0 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-xs font-semibold"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={!summary.isReadyToSubmit || isSubmitting}
            onClick={processSplitPayment}
            className={`font-bold flex items-center space-x-2 px-5 ${
              summary.isReadyToSubmit
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Procesando Pago...</span>
              </>
            ) : (
              <>
                <Receipt className="size-4" />
                <span>
                  {summary.isReadyToSubmit
                    ? `Facturar $${summary.orderTotal.toLocaleString()}`
                    : `Faltan $${Math.abs(summary.remainingBalance).toLocaleString()}`}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SplitBillDialog;
