import React from 'react';
import { Receipt, CheckCircle, Clock, Eye, Plus } from 'lucide-react';
import { Purchase } from '../types/inventory.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  purchases: Purchase[];
  onOpenNewPurchase: () => void;
  onSelectPurchaseDetail: (purchase: Purchase) => void;
  onReceivePurchase: (purchaseId: string) => void;
}

export const PurchasesTab: React.FC<Props> = ({
  purchases,
  onOpenNewPurchase,
  onSelectPurchaseDetail,
  onReceivePurchase,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onOpenNewPurchase}
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Factura de Compra</span>
        </Button>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Factura / Remisión</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total Factura</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {purchases.map((purchase) => {
                const total = parseFloat(purchase.totalAmount || '0');
                return (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-bold text-foreground text-sm flex items-center space-x-2">
                      <Receipt className="w-4 h-4 text-primary shrink-0" />
                      <span>{purchase.invoiceNumber}</span>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="font-medium">{purchase.supplier?.name || 'Proveedor no disponible'}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {purchase.supplier?.documentType}: {purchase.supplier?.documentNumber}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {purchase.status === 'received' ? (
                        <Badge variant="outline" className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30 px-2.5 py-0.5">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          <span>Recibida (Stock Actualizado)</span>
                        </Badge>
                      ) : purchase.status === 'draft' ? (
                        <Badge variant="outline" className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/15 border-amber-500/30 px-2.5 py-0.5">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Borrador (Pendiente)</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="inline-flex items-center space-x-1 text-[11px] font-bold text-destructive bg-destructive/15 border-destructive/30 px-2.5 py-0.5">
                          <span>Cancelada</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onSelectPurchaseDetail(purchase)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver Líneas</span>
                      </Button>

                      {purchase.status === 'draft' && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onReceivePurchase(purchase.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center space-x-1 shadow-md shadow-emerald-600/20"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Recibir Stock</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="p-8 text-center text-muted-foreground">
                    No se han registrado facturas de compra aún. Haz clic en "Nueva Factura de Compra".
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
