import React from 'react';
import { Receipt } from 'lucide-react';
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
  return (
    <Dialog open={Boolean(purchase)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-primary" />
            <span>Factura #{purchase?.invoiceNumber}</span>
          </DialogTitle>
          <DialogDescription>
            Proveedor: {purchase?.supplier?.name} (NIT: {purchase?.supplier?.documentNumber})
          </DialogDescription>
        </DialogHeader>

        {purchase && (
          <div className="space-y-3 mb-5 max-h-64 overflow-y-auto rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-3">Insumo</TableHead>
                  <TableHead className="p-3">Cantidad</TableHead>
                  <TableHead className="p-3">Costo Unitario</TableHead>
                  <TableHead className="p-3 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchase.items?.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="p-3 font-semibold text-foreground">
                      {it.inventoryItem?.name || 'Insumo'}
                    </TableCell>
                    <TableCell className="p-3 font-mono">
                      {parseFloat(it.quantity).toLocaleString()} {it.inventoryItem?.unit}
                    </TableCell>
                    <TableCell className="p-3 font-mono">
                      ${parseFloat(it.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right">
                      ${parseFloat(it.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {purchase && (
          <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
            <div>
              <span className="text-muted-foreground">Estado: </span>
              <span className="font-bold text-foreground uppercase">{purchase.status}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground mr-2">Total Compra:</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                ${parseFloat(purchase.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDetailModal;
