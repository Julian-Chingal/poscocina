import React from 'react';
import { CheckCircle, XCircle, Edit2, Trash2, Boxes, Printer } from 'lucide-react';
import { Product, Category } from '../types/catalog.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface Props {
  product: Product;
  category?: Category;
  isManager: boolean;
  onToggleAvailability: (id: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCard: React.FC<Props> = ({
  product,
  category,
  isManager,
  onToggleAvailability,
  onEdit,
  onDelete,
}) => {
  const taxPercent = product.taxRate ? Number(product.taxRate) * 100 : 8;

  return (
    <Card
      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-md relative group ${
        product.isAvailable
          ? 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
          : 'bg-slate-900/40 border-slate-800 opacity-60'
      }`}
    >
      <CardContent className="p-0">
        <div className="flex items-start justify-between mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${category?.color || '#3b82f6'}20`,
              color: category?.color || '#60a5fa',
            }}
          >
            {category?.name || 'Categoría'}
          </span>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onToggleAvailability(product.id)}
              className={`flex items-center space-x-1 text-[11px] font-bold px-2 h-7 rounded-lg border transition-all ${
                product.isAvailable
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/60'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-400 hover:bg-rose-900/60'
              }`}
            >
              {product.isAvailable ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Disponible</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  <span>Agotado (86)</span>
                </>
              )}
            </Button>

            {isManager && (
              <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => onEdit(product)}
                  title="Editar producto"
                  className="h-7 w-7 p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => onDelete(product)}
                  title="Eliminar producto"
                  className="h-7 w-7 p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-white mt-1">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{product.description}</p>
        )}
      </CardContent>

      <CardFooter className="p-0 mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
        <div>
          <span className="text-base font-black text-orange-400">
            ${Number(product.price).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 ml-1.5 font-medium">
            ({taxPercent === 8 ? 'INC 8%' : taxPercent === 19 ? 'IVA 19%' : 'Exento'})
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {product.trackInventory && (
            <span
              title="Control de inventario activo"
              className="text-[10px] text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-800/50 flex items-center space-x-1"
            >
              <Boxes className="w-3 h-3" />
              <span>Receta</span>
            </span>
          )}
          <span className="text-[11px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 flex items-center space-x-1">
            <Printer className="w-3 h-3 text-slate-400" />
            <span>{product.printerStation === 'bar' ? 'Barra' : 'Cocina'}</span>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
