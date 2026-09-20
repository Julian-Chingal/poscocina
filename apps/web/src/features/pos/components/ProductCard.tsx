import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types/pos.types';
import { Button } from '@/components/ui/button';

interface Props {
  product: Product;
  onAddToCart: (p: Product) => void;
}

export const ProductCard: React.FC<Props> = React.memo(({ product, onAddToCart }) => {
  const priceNum = parseFloat(product.price || '0');

  return (
    <Button
      variant="ghost"
      type="button"
      onClick={() => onAddToCart(product)}
      className="h-auto bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-orange-500/60 rounded-2xl p-3.5 text-left flex flex-col justify-between space-y-2 transition-all cursor-pointer shadow-sm group active:scale-[0.98] w-full items-stretch whitespace-normal"
    >
      <div>
        <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
          {product.name}
        </h4>
        {product.description && (
          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 font-normal">{product.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 w-full">
        <span className="text-xs font-black font-mono text-orange-400">
          ${priceNum.toLocaleString()}
        </span>
        <span className="p-1 rounded-lg bg-orange-600/20 text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition">
          <Plus className="w-3.5 h-3.5" />
        </span>
      </div>
    </Button>
  );
});
