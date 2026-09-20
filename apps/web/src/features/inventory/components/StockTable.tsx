import React from 'react';
import { Search, Plus, AlertTriangle, ArrowDownRight } from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
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
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewItemModal: () => void;
  onOpenMovementModal: (item: InventoryItem) => void;
}

export const StockTable: React.FC<Props> = ({
  items,
  searchQuery,
  onSearchChange,
  onOpenNewItemModal,
  onOpenMovementModal,
}) => (
  <Card className="shadow-sm overflow-hidden">
    <CardHeader className="p-4 sm:p-6 pb-4 border-b border-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
          <Input
            type="text"
            placeholder="Buscar insumo por nombre..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 h-9 text-xs"
          />
        </div>

        <Button
          type="button"
          onClick={onOpenNewItemModal}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 h-auto rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Insumo</span>
        </Button>
      </div>
    </CardHeader>

    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Insumo</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>Stock Actual</TableHead>
            <TableHead>Costo / Unidad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const current = parseFloat(item.currentStock || '0');
            const threshold = parseFloat(item.alertThreshold || '0');
            const isLow = current <= threshold;

            return (
              <TableRow key={item.id}>
                <TableCell className="font-bold text-white">{item.name}</TableCell>
                <TableCell className="font-mono text-slate-400">{item.unit}</TableCell>
                <TableCell className="font-mono font-bold text-white">{current}</TableCell>
                <TableCell className="font-mono text-slate-300">
                  ${parseFloat(item.costPerUnit || '0').toLocaleString()}
                </TableCell>
                <TableCell>
                  {isLow ? (
                    <Badge variant="destructive" className="space-x-1 text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/40">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Stock Crítico</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="space-x-1 text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      <span>Disponible</span>
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenMovementModal(item)}
                    className="px-2.5 py-1.5 h-auto bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 transition cursor-pointer border border-slate-700"
                  >
                    <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                    <span>Ajustar</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                No hay insumos registrados en el inventario.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);
