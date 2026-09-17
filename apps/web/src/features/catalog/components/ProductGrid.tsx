import React from 'react';
import { Utensils } from 'lucide-react';
import { Product, Category } from '../types/catalog.types';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductCard } from './ProductCard';

interface Props {
  products: Product[];
  categories: Category[];
  loading: boolean;
  isManager: boolean;
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
  onOpenCreateProduct,
  onToggleAvailability,
  onEditProduct,
  onDeleteProduct,
}) => {
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-slate-400 animate-spin text-2xl">⏳</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Utensils}
        title="No se encontraron productos"
        description="No hay productos registrados en esta categoría o con este término de búsqueda."
        actionLabel={isManager ? 'Crear Primer Producto' : undefined}
        onAction={isManager ? onOpenCreateProduct : undefined}
        className="my-6"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
