import React from "react";
import { SearchX, PackageOpen, RotateCcw } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Product } from "../types/pos.types";
import { Button } from "@/components/ui/button";

interface Props {
  products: Product[];
  totalCatalogCount?: number;
  activeCategoryName?: string;
  searchQuery?: string;
  onResetFilters?: () => void;
  onAddToCart: (product: Product) => void;
  onCustomizeProduct?: (product: Product) => void;
}

export const ProductCatalogGrid: React.FC<Props> = ({
  products,
  activeCategoryName,
  searchQuery,
  onResetFilters,
  onAddToCart,
  onCustomizeProduct,
}) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 backdrop-blur-xs min-h-85 space-y-3.5">
        <div className="size-12 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground ring-1 ring-border shadow-2xs">
          {searchQuery ? (
            <SearchX className="size-6 text-muted-foreground" />
          ) : (
            <PackageOpen className="size-6 text-muted-foreground" />
          )}
        </div>

        <div className="max-w-md space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            {searchQuery
              ? `Sin resultados para "${searchQuery}"`
              : `Categoría sin productos`}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {searchQuery
              ? "No encontramos ningún plato o bebida que coincida con tu búsqueda. Revisa la ortografía o intenta buscar por otro término."
              : `Actualmente no hay productos disponibles o activos en ${
                  activeCategoryName
                    ? `"${activeCategoryName}"`
                    : "esta categoría"
                }.`}
          </p>
        </div>

        {onResetFilters && (
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onResetFilters}
            className="rounded-xl text-xs font-semibold gap-2 border-border/80 hover:bg-muted cursor-pointer shadow-2xs"
          >
            <RotateCcw className="size-3.5" />
            <span>
              {searchQuery ? "Borrar búsqueda" : "Ver todos los productos"}
            </span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5 max-h-[calc(100vh-260px)] min-h-90 overflow-y-auto pr-1 pb-4 custom-scrollbar auto-rows-fr">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          onAddToCart={onAddToCart}
          onCustomizeProduct={onCustomizeProduct}
        />
      ))}
    </div>
  );
};

export default ProductCatalogGrid;
