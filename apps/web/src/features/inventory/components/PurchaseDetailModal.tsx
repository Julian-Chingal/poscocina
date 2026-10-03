import React from 'react';
import { Receipt, Calendar, Building2, CheckCircle, Clock } from 'lucide-react';
import { Purchase } from '../types/inventory.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface Props {
  purchase: Purchase | null;
  onClose: () => void;
}

export const PurchaseDetailModal: React.FC<Props> = ({ purchase, onClose }) => {
  if (!purchase) return null;

  const total = parseFloat(purchase.totalAmount || '0');
  const dateObj = new Date(purchase.purchaseDate || purchase.createdAt);

  return (
    <Dialog open={Boolean(purchase)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="xl" onClose={onClose} className="rounded-2xl max-w-2xl">
        <DialogHeader className="border-b border-border/70 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-foreground">
                  Factura #{purchase.invoiceNumber}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{purchase.supplier?.name || 'Proveedor'}</span>
                  </span>
                  <span>·</span>
                  <span>{purchase.supplier?.documentType}: {purchase.supplier?.documentNumber}</span>
                </DialogDescription>
              </div>
            </div>

            <div>
              {purchase.status === 'received' ? (
                <Badge
                  variant="outline"
                  className="space-x-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30 px-3 py-1 rounded-xl"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  <span>Stock Recibido</span>
                </Badge>
              ) : purchase.status === 'draft' ? (
                <Badge
                  variant="outline"
                  className="space-x-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/15 border-amber-500/30 px-3 py-1 rounded-xl"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500 mr-1" />
                  <span>Pendiente Recepción</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="space-x-1 text-xs font-bold text-destructive bg-destructive/15 border-destructive/30 px-3 py-1 rounded-xl"
                >
                  <span>Cancelada</span>
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Date and Notes Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/30 rounded-xl border border-border/80 text-xs">
          <div className="flex items-center space-x-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Fecha de Emisión:</span>
            <span className="font-bold text-foreground">{dateObj.toLocaleDateString()}</span>
          </div>
          {purchase.notes && (
            <div className="text-muted-foreground truncate max-w-xs">
              <span className="font-semibold text-foreground">Nota:</span> {purchase.notes}
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Líneas de Insumos Registradas ({purchase.items?.length || 0})
          </span>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-border/80 bg-card overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="py-2.5 px-3 text-xs font-bold text-muted-foreground">Insumo</TableHead>
                  <TableHead className="py-2.5 px-3 text-xs font-bold text-muted-foreground">Cantidad</TableHead>
                  <TableHead className="py-2.5 px-3 text-xs font-bold text-muted-foreground">Costo Unitario</TableHead>
                  <TableHead className="py-2.5 px-3 text-xs font-bold text-muted-foreground text-right pr-4">Total Línea</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchase.items?.map((it) => {
                  const qty = parseFloat(it.quantity || '0');
                  const unitCost = parseFloat(it.unitCost || '0');
                  const lineTotal = parseFloat(it.totalCost || '0');

                  return (
                    <TableRow key={it.id} className="hover:bg-muted/20">
                      <TableCell className="py-2.5 px-3 font-bold text-xs text-foreground">
                        {it.inventoryItem?.name || 'Insumo'}
                      </TableCell>
                      <TableCell className="py-2.5 px-3 font-mono text-xs">
                        <span className="font-bold text-foreground">{qty.toLocaleString()}</span>{' '}
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {it.inventoryItem?.unit || 'und'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 px-3 font-mono text-xs text-muted-foreground">
                        ${unitCost.toLocaleString('es-CO')}
                      </TableCell>
                      <TableCell className="py-2.5 px-3 font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 text-right pr-4">
                        ${Math.round(lineTotal).toLocaleString('es-CO')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Invoice Total Banner */}
        <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border/80">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">
              Total Liquidado de la Factura
            </span>
            <span className="text-[11px] text-muted-foreground">
              {purchase.status === 'received' ? 'Ingresado al costo promedio ponderado' : 'Pendiente por ingresar a stock'}
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono font-black text-xl text-emerald-600 dark:text-emerald-400">
              ${Math.round(total).toLocaleString('es-CO')} <span className="text-xs font-sans text-muted-foreground">COP</span>
            </span>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" type="button" onClick={onClose} className="rounded-xl text-xs font-semibold">
            Cerrar Detalle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDetailModal;
