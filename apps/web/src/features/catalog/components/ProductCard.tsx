import React from 'react';
import {
  XCircle,
  Pencil,
  Trash2,
  Boxes,
  ChefHat,
  Coffee,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { Product, Category } from '../types/catalog.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  product: Product;
  category?: Category;
  isManager: boolean;
  onToggleAvailability: (id: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCard: React.FC<Props> = React.memo(
  ({
    product,
    category,
    isManager,
    onToggleAvailability,
    onEdit,
    onDelete,
  }) => {
    const taxPercent = product.taxRate ? Number(product.taxRate) * 100 : 8;
    const priceNum = Number(product.price) || 0;
    const formattedPrice = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(priceNum);

    const categoryColor = category?.color || 'var(--primary)';
    const isBarStation = product.printerStation === 'bar';

    return (
      <div
        className={`group relative h-full bg-card rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
          product.isAvailable
            ? 'border-border/80 hover:border-primary/50 hover:-translate-y-0.5'
            : 'border-destructive/30 bg-card/60 opacity-80'
        }`}
      >
        {/* Top/Left Category Color Indicator Bar */}
        <div
          className="h-1 w-full shrink-0 transition-opacity"
          style={{ backgroundColor: categoryColor }}
        />

        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
          {/* Top Bar: Category badge & Status / Actions */}
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5"
              style={{
                backgroundColor: `${categoryColor}15`,
                color: categoryColor,
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: categoryColor }}
              />
              <span>{category?.name || 'General'}</span>
            </span>

            <div className="flex items-center gap-1.5">
              {/* Interactive Availability Toggle Pill */}
              <button
                type="button"
                onClick={() => onToggleAvailability(product.id)}
                title={
                  product.isAvailable
                    ? 'Click para marcar como Agotado (86)'
                    : 'Click para marcar como Disponible'
                }
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer select-none active:scale-95 ${
                  product.isAvailable
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 shadow-2xs'
                    : 'bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30 shadow-2xs'
                }`}
              >
                {product.isAvailable ? (
                  <>
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Disponible</span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-3 text-destructive" />
                    <span>Agotado (86)</span>
                  </>
                )}
              </button>

              {/* Manager Actions Menu */}
              {isManager && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                    >
                      <MoreVertical className="size-3.5" />
                      <span className="sr-only">Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 rounded-xl">
                    <DropdownMenuItem
                      onClick={() => onEdit(product)}
                      className="gap-2 text-xs font-semibold cursor-pointer"
                    >
                      <Pencil className="size-3.5 text-muted-foreground" />
                      <span>Editar plato</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(product)}
                      className="gap-2 text-xs font-semibold text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Product Name & Description */}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]">
              {product.description || (
                <span className="italic text-muted-foreground/50">Sin descripción agregada</span>
              )}
            </p>
          </div>

          {/* Middle metadata chips (Prep Time, Recipe, Station) */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {/* Station Chip */}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted/80 text-foreground/80 border border-border/60">
              {isBarStation ? (
                <Coffee className="size-3 text-amber-500" />
              ) : (
                <ChefHat className="size-3 text-primary" />
              )}
              <span>{isBarStation ? 'Barra' : 'Cocina'}</span>
            </span>

            {/* Inventory / Recipe tracking */}
            {product.trackInventory && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                <Boxes className="size-3" />
                <span>Receta</span>
              </span>
            )}

            {/* Prep Time */}
            {product.prepTimeMin && product.prepTimeMin > 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                <Clock className="size-3" />
                <span>{product.prepTimeMin} min</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Card Footer: Price & Tax Chip */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/30 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black text-foreground tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <Badge
            variant="secondary"
            className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground border-border/60"
          >
            {taxPercent === 8 ? 'INC 8%' : taxPercent === 19 ? 'IVA 19%' : 'Exento'}
          </Badge>
        </div>
      </div>
    );
  }
);

ProductCard.displayName = 'ProductCard';

export default ProductCard;
