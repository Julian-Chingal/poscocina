import React from 'react';
import { Trophy, UtensilsCrossed } from 'lucide-react';
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
  const maxRevenue = Math.max(...topProducts.map((p) => p.revenue), 1);

  const getRankBadge = (idx: number) => {
    if (idx === 0) {
      return (
        <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold text-[11px] inline-flex items-center justify-center">
          1
        </span>
      );
    }
    if (idx === 1) {
      return (
        <span className="w-5 h-5 rounded-full bg-slate-400/15 text-slate-700 dark:text-slate-300 border border-slate-400/30 font-bold text-[11px] inline-flex items-center justify-center">
          2
        </span>
      );
    }
    if (idx === 2) {
      return (
        <span className="w-5 h-5 rounded-full bg-amber-700/15 text-amber-800 dark:text-amber-500 border border-amber-700/30 font-bold text-[11px] inline-flex items-center justify-center">
          3
        </span>
      );
    }
    return (
      <span className="text-muted-foreground font-mono text-xs pl-1.5">
        {idx + 1}
      </span>
    );
  };

  return (
    <Card className="w-full min-w-0 lg:col-span-2 shadow-xs border-border/80 overflow-hidden flex flex-col justify-between">
      <div>
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="font-bold text-sm text-foreground">
                Top 10 Productos Más Vendidos
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
                Platos y bebidas ordenados por volumen de despacho e ingresos brutos
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full min-w-0 overflow-x-auto">
            <Table className="table-fixed w-full min-w-[520px]">
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/60">
                  <TableHead className="w-[8%] text-center text-xs font-semibold">#</TableHead>
                  <TableHead className="w-[34%] text-xs font-semibold">Producto</TableHead>
                  <TableHead className="w-[18%] text-xs font-semibold">Categoría</TableHead>
                  <TableHead className="w-[14%] text-right text-xs font-semibold">Precio Unit.</TableHead>
                  <TableHead className="w-[12%] text-center text-xs font-semibold">Cant.</TableHead>
                  <TableHead className="w-[14%] text-right text-xs font-semibold">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <UtensilsCrossed className="w-6 h-6 text-muted-foreground/40" />
                        <span className="text-xs">Sin movimientos de venta registrados en este período</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  topProducts.map((p, idx) => {
                    const quantity = p.quantity || p.unitsSold || 0;
                    const revenue = p.revenue || 0;
                    const unitPrice =
                      p.price && !isNaN(p.price) && p.price > 0
                        ? p.price
                        : quantity > 0
                        ? Math.round(revenue / quantity)
                        : 0;

                    const revShare = Math.min(Math.round((revenue / maxRevenue) * 100), 100);

                    return (
                      <TableRow key={p.id || `prod-${idx}`} className="border-border/50 hover:bg-muted/30 transition-colors">
                        <TableCell className="text-center font-bold">
                          {getRankBadge(idx)}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground truncate">
                          {p.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-muted/60 text-muted-foreground border-border/60 truncate font-normal"
                          >
                            {p.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-xs whitespace-nowrap">
                          {formatCurrency(unitPrice)}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-muted/50 text-foreground">
                            {quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(revenue)}
                            </span>
                            <div className="w-16 h-1 rounded-full bg-muted/60 mt-1 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500/80"
                                style={{ width: `${revShare}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

