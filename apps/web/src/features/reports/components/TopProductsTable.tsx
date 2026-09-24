import React from 'react';
import { Award } from 'lucide-react';
import { TopProduct } from '../types/reports.types';
import { formatCurrency } from '../utils/formatCurrency';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface TopProductsTableProps {
  topProducts: TopProduct[];
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({ topProducts }) => {
  return (
    <Card className="w-full min-w-0 lg:col-span-2 shadow-sm overflow-hidden">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-400 shrink-0" />
          <div className="min-w-0">
            <CardTitle className="text-sm truncate">Top 10 Productos Más Vendidos</CardTitle>
            <CardDescription className="text-[11px] mt-0.5 truncate">
              Platos y bebidas con mayor volumen e ingresos brutos
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="w-full min-w-0 overflow-x-auto">
          <Table className="table-fixed w-full min-w-[500px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[8%]">#</TableHead>
                <TableHead className="w-[32%]">Producto</TableHead>
                <TableHead className="w-[20%]">Categoría</TableHead>
                <TableHead className="w-[14%] text-right">Precio Unit.</TableHead>
                <TableHead className="w-[12%] text-center">Cant. Vendida</TableHead>
                <TableHead className="w-[14%] text-right">Total Ingresos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Sin movimientos de venta registrados en este periodo
                  </TableCell>
                </TableRow>
              ) : (
                topProducts.map((p, idx) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold text-amber-600 dark:text-amber-400">{idx + 1}</TableCell>
                    <TableCell className="font-semibold text-foreground truncate">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-muted-foreground text-[10px] bg-muted/50 border-border truncate">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground whitespace-nowrap">{formatCurrency(p.price)}</TableCell>
                    <TableCell className="text-center font-bold text-foreground whitespace-nowrap">{p.quantity}</TableCell>
                    <TableCell className="text-right font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatCurrency(p.revenue)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
