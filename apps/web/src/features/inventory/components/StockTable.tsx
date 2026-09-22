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
    <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
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
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 h-auto rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-primary/20"
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
                <TableCell className="font-bold text-foreground">{item.name}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{item.unit}</TableCell>
                <TableCell className="font-mono font-bold text-foreground">{current}</TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  ${parseFloat(item.costPerUnit || '0').toLocaleString()}
                </TableCell>
                <TableCell>
                  {isLow ? (
                    <Badge variant="destructive" className="space-x-1 text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/30">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Stock Crítico</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="space-x-1 text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
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
                    className="px-2.5 py-1.5 h-auto rounded-lg text-xs font-semibold inline-flex items-center space-x-1 transition cursor-pointer"
                  >
                    <ArrowDownRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Ajustar</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground text-xs">
                No hay insumos registrados en el inventario.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);
