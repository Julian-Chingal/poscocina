import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { InventoryMovement } from '../types/inventory.types';
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
  movements: InventoryMovement[];
}

export const MovementsTab: React.FC<Props> = ({ movements }) => {
  return (
    <Card className="w-full min-w-0 rounded-2xl shadow-sm overflow-hidden">
      <div className="w-full min-w-0 overflow-x-auto">
        <Table className="w-full min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">Fecha y Hora</TableHead>
              <TableHead className="w-[18%]">Tipo de Movimiento</TableHead>
              <TableHead className="w-[28%]">Insumo</TableHead>
              <TableHead className="w-[16%]">Cantidad</TableHead>
              <TableHead className="w-[18%]">Motivo / Origen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((m) => {
              const movType = (m.movementType || m.type || '') as string;
              const isSale = movType === 'sale' || movType === 'order_consumed' || movType === 'sale_deduction';
              const isPurchase = movType === 'purchase';
              const rawQty = parseFloat(m.quantity) || 0;
              const isNegative = rawQty < 0 || isSale;
              const absQty = Math.abs(rawQty);

              const insumoName = m.inventoryItem?.name || m.itemName || m.inventoryItemId || 'Insumo';
              const insumoUnit = m.inventoryItem?.unit || m.unit || '';

              return (
                <TableRow key={m.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {isSale ? (
                      <Badge variant="outline" className="inline-flex items-center space-x-1 text-[11px] font-bold text-destructive bg-destructive/15 border-destructive/30 px-2.5 py-0.5">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        <span>Venta (Automático)</span>
                      </Badge>
                    ) : isPurchase ? (
                      <Badge variant="outline" className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30 px-2.5 py-0.5">
                        <ArrowDownRight className="w-3 h-3 mr-1" />
                        <span>Compra / Factura</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/15 border-amber-500/30 px-2.5 py-0.5">
                        <span>Ajuste / Merma</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-foreground">
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-foreground whitespace-normal break-words">
                        {insumoName}
                      </span>
                      {insumoUnit && (
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Unidad: {insumoUnit}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-bold whitespace-nowrap">
                    <span className={isNegative ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400 font-extrabold'}>
                      {isNegative ? '-' : '+'}
                      {absQty.toLocaleString()} {insumoUnit}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-normal break-words">
                    {m.notes || '-'}
                  </TableCell>
                </TableRow>
              );
            })}
            {movements.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="p-8 text-center text-muted-foreground">
                  No se han registrado movimientos de inventario todavía.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
