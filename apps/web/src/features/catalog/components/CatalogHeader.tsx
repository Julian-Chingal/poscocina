import React from 'react';
import { Utensils, Plus } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';

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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
          <Utensils className="w-3.5 h-3.5" />
          <span>Gestión Gastronómica</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Menú, Platos y Precios
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
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
          <button
            type="button"
            onClick={onOpenCreateProduct}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-blue-500/20 transition cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        )}
      </div>
    </div>
  );
};
