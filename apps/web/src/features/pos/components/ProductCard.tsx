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
      className="h-auto bg-card hover:bg-card border border-border/80 hover:border-primary/50 rounded-2xl p-3.5 text-left flex flex-col justify-between space-y-2.5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 group active:scale-[0.97] w-full items-stretch whitespace-normal select-none"
    >
      <div className="space-y-1">
        <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {product.name}
        </h4>
        {product.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 font-normal leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-border/60 w-full mt-auto">
        <div className="flex items-baseline gap-0.5">
          <span className="text-[11px] font-semibold text-primary/80">$</span>
          <span className="text-sm font-extrabold font-mono tabular-nums text-foreground group-hover:text-primary transition-colors">
            {priceNum.toLocaleString()}
          </span>
        </div>
        <span className="p-1.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 transition-all duration-150 shadow-2xs">
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
        </span>
      </div>
    </Button>
  );
});
