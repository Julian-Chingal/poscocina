import React from 'react';
import {
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  ChefHat,
  Coffee,
  XCircle,
} from 'lucide-react';
import { Product, Category } from '../types/catalog.types';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Props {
  products: Product[];
  categories: Category[];
  loading: boolean;
  isManager: boolean;
  viewMode?: 'grid' | 'table';
  onOpenCreateProduct: () => void;
  onToggleAvailability: (id: string) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export const ProductGrid: React.FC<Props> = ({
  products,
  categories,
  loading,
  isManager,
  viewMode = 'grid',
  onOpenCreateProduct,
  onToggleAvailability,
  onEditProduct,
  onDeleteProduct,
}) => {
  // Skeleton Loading State
  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="h-48 rounded-2xl border border-border/60 bg-card/50 p-5 space-y-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-muted rounded-md" />
              <div className="h-6 w-24 bg-muted rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-muted rounded-md" />
              <div className="h-3 w-1/2 bg-muted/70 rounded-md" />
            </div>
            <div className="pt-4 flex items-center justify-between border-t border-border/40">
              <div className="h-6 w-24 bg-muted rounded-md" />
              <div className="h-5 w-16 bg-muted rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 backdrop-blur-xs min-h-[320px] space-y-3.5 my-4">
        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/20 shadow-2xs">
          <UtensilsCrossed className="size-6" />
        </div>
        <div className="max-w-md space-y-1">
          <h3 className="text-base font-bold text-foreground">
            No se encontraron productos
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No hay productos registrados que coincidan con la categoría o término de búsqueda.
          </p>
        </div>
        {isManager && (
          <Button
            type="button"
            onClick={onOpenCreateProduct}
            className="gap-2 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 shadow-xs cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Crear Primer Producto</span>
          </Button>
        )}
      </div>
    );
  }

  // Table View
  if (viewMode === 'table') {
    return (
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border/70 hover:bg-transparent">
              <TableHead className="w-[120px] text-xs font-bold">Estado</TableHead>
              <TableHead className="text-xs font-bold">Plato / Bebida</TableHead>
              <TableHead className="text-xs font-bold">Categoría</TableHead>
              <TableHead className="text-xs font-bold">Estación</TableHead>
              <TableHead className="text-xs font-bold">Impuesto</TableHead>
              <TableHead className="text-right text-xs font-bold">Precio</TableHead>
              {isManager && <TableHead className="w-[100px] text-right text-xs font-bold">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const category = categories.find((c) => c.id === product.categoryId);
              const categoryColor = category?.color || 'var(--primary)';
              const isBar = product.printerStation === 'bar';
              const taxPercent = product.taxRate ? Number(product.taxRate) * 100 : 8;
              const formattedPrice = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0,
              }).format(Number(product.price) || 0);

              return (
                <TableRow
                  key={product.id}
                  className={`border-border/60 hover:bg-muted/30 transition-colors ${
                    !product.isAvailable ? 'opacity-65 bg-muted/10' : ''
                  }`}
                >
                  {/* Availability Toggle */}
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onToggleAvailability(product.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer select-none ${
                        product.isAvailable
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20'
                          : 'bg-destructive/10 text-destructive border-destructive/25 hover:bg-destructive/20'
                      }`}
                      title="Click para alternar disponibilidad"
                    >
                      {product.isAvailable ? (
                        <>
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Disponible</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3 text-destructive" />
                          <span>Agotado</span>
                        </>
                      )}
                    </button>
                  </TableCell>

                  {/* Name & Description */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="font-bold text-sm text-foreground block">
                        {product.name}
                      </span>
                      {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1.5"
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
                  </TableCell>

                  {/* Station */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/80">
                      {isBar ? (
                        <Coffee className="size-3 text-amber-500" />
                      ) : (
                        <ChefHat className="size-3 text-primary" />
                      )}
                      <span>{isBar ? 'Barra' : 'Cocina'}</span>
                    </span>
                  </TableCell>

                  {/* Tax */}
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 border-border/70">
                      {taxPercent === 8 ? 'INC 8%' : taxPercent === 19 ? 'IVA 19%' : 'Exento'}
                    </Badge>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-right font-black text-sm text-foreground">
                    {formattedPrice}
                  </TableCell>

                  {/* Actions */}
                  {isManager && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => onEditProduct(product)}
                          title="Editar plato"
                          className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => onDeleteProduct(product)}
                          title="Eliminar plato"
                          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className="w-full min-w-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5 sm:gap-5 auto-rows-fr">
      {products.map((product) => {
        const category = categories.find((c) => c.id === product.categoryId);
        return (
          <ProductCard
            key={product.id}
            product={product}
            category={category}
            isManager={isManager}
            onToggleAvailability={onToggleAvailability}
            onEdit={onEditProduct}
            onDelete={onDeleteProduct}
          />
        );
      })}
    </div>
  );
};

export default ProductGrid;
