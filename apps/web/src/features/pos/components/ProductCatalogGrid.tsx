import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../types/pos.types';

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const ProductCatalogGrid: React.FC<Props> = ({ products, onAddToCart }) => {
  if (products.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-2xl">
        No se encontraron productos en esta categoría o búsqueda.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[68vh] overflow-y-auto pr-1">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};
