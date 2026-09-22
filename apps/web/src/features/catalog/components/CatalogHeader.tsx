import React from 'react';
import { Utensils, Plus } from 'lucide-react';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';

interface Props {
  search: string;
  isManager: boolean;
  onSearchChange: (val: string) => void;
  onOpenCreateProduct: () => void;
}

export const CatalogHeader: React.FC<Props> = ({
  search,
  isManager,
  onSearchChange,
  onOpenCreateProduct,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-border gap-4">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          <Utensils className="w-3.5 h-3.5" />
          <span>Gestión Gastronómica</span>
        </div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          Menú, Platos y Precios
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configuración de catálogo, impuestos (INC 8% / IVA 19%), disponibilidad y estaciones.
        </p>
      </div>

      <div className="flex items-center space-x-3 w-full sm:w-auto">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar plato o bebida..."
          className="flex-1 sm:w-64"
        />

        {isManager && (
          <Button
            type="button"
            onClick={onOpenCreateProduct}
            className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 h-10 rounded-xl shadow-lg hover:shadow-primary/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CatalogHeader;
