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
    <Card className="bg-slate-800/60 border-slate-700/60 rounded-2xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-900/80">
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400 font-semibold text-xs">Fecha y Hora</TableHead>
            <TableHead className="text-slate-400 font-semibold text-xs">Tipo de Movimiento</TableHead>
            <TableHead className="text-slate-400 font-semibold text-xs">Insumo</TableHead>
            <TableHead className="text-slate-400 font-semibold text-xs">Cantidad</TableHead>
            <TableHead className="text-slate-400 font-semibold text-xs">Motivo / Origen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m) => {
            const movType = (m.movementType || m.type || '') as string;
            const isSale = movType === 'sale' || movType === 'order_consumed' || movType === 'sale_deduction';
            const isPurchase = movType === 'purchase';

            return (
              <TableRow key={m.id}>
                <TableCell className="font-mono text-slate-400 whitespace-nowrap">
                  {new Date(m.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {isSale ? (
                    <Badge variant="outline" className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 border-rose-800/40 px-2 py-0.5">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      <span>Venta (Automático)</span>
                    </Badge>
                  ) : isPurchase ? (
                    <Badge variant="outline" className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border-emerald-800/40 px-2 py-0.5">
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                      <span>Compra / Recepción</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border-amber-800/40 px-2 py-0.5">
                      <span>Ajuste / Merma</span>
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-bold text-white">
                  {m.inventoryItem?.name || m.inventoryItemId}
                </TableCell>
                <TableCell className="font-mono font-bold text-slate-200 whitespace-nowrap">
                  {isSale ? '-' : '+'}
                  {parseFloat(m.quantity).toLocaleString()} {m.inventoryItem?.unit || ''}
                </TableCell>
                <TableCell className="text-slate-400 font-mono text-xs">
                  {m.notes || '-'}
                </TableCell>
              </TableRow>
            );
          })}
          {movements.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="p-8 text-center text-slate-500">
                No se han registrado movimientos de inventario todavía.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
