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
    <Card className="lg:col-span-2 shadow-sm overflow-hidden">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-400" />
          <div>
            <CardTitle className="text-sm">Top 10 Productos Más Vendidos</CardTitle>
            <CardDescription className="text-[11px] mt-0.5">
              Platos y bebidas con mayor volumen e ingresos brutos
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio Unit.</TableHead>
              <TableHead className="text-center">Cant. Vendida</TableHead>
              <TableHead className="text-right">Total Ingresos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                  Sin movimientos de venta registrados en este periodo
                </TableCell>
              </TableRow>
            ) : (
              topProducts.map((p, idx) => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold text-amber-400">{idx + 1}</TableCell>
                  <TableCell className="font-semibold text-white">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-slate-300 text-[10px] bg-slate-800 border-slate-700">
                      {p.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-300">{formatCurrency(p.price)}</TableCell>
                  <TableCell className="text-center font-bold text-amber-300">{p.quantity}</TableCell>
                  <TableCell className="text-right font-extrabold text-emerald-400">
                    {formatCurrency(p.revenue)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
