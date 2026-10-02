import React from 'react';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { Product } from '../types/pos.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  product: Product;
  onAddToCart: (p: Product) => void;
  onCustomizeProduct?: (p: Product) => void;
}

export const ProductCard: React.FC<Props> = React.memo(
  ({ product, onAddToCart, onCustomizeProduct }) => {
    const priceNum = parseFloat(product.price || '0');
    const hasModifiers = Boolean(product.modifierGroups && product.modifierGroups.length > 0);

    const handleClick = () => {
      if (hasModifiers && onCustomizeProduct) {
        onCustomizeProduct(product);
      } else {
        onAddToCart(product);
      }
    };

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className="h-auto bg-card hover:bg-card border border-border/80 hover:border-primary/50 rounded-2xl p-3.5 text-left flex flex-col justify-between space-y-2.5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 group active:scale-[0.98] w-full select-none"
      >
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-1.5">
            <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h4>
            {hasModifiers && (
              <Badge
                variant="secondary"
                className="text-[9px] px-1.5 py-0 shrink-0 font-medium bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
              >
                <SlidersHorizontal className="size-2.5" />
                <span>Toppings</span>
              </Badge>
            )}
          </div>
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

          <div className="flex items-center gap-1">
            {hasModifiers && onCustomizeProduct ? (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomizeProduct(product);
                }}
                className="h-7 px-2 text-[10px] rounded-xl text-primary font-bold hover:bg-primary hover:text-primary-foreground gap-1"
              >
                <SlidersHorizontal className="size-3" />
                <span>Extras</span>
              </Button>
            ) : null}

            <span className="p-1.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 transition-all duration-150 shadow-2xs">
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </div>
    );
  }
);
