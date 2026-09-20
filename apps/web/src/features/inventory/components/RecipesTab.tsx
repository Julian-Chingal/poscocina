import React from 'react';
import { Plus, Save, Trash2, CookingPot } from 'lucide-react';
import { Product, InventoryItem, RecipeIngredient } from '../types/inventory.types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface Props {
  products: Product[];
  items: InventoryItem[];
  selectedProductId: string;
  currentRecipe: RecipeIngredient[];
  isSaving: boolean;
  onSelectProduct: (id: string) => void;
  onAddIngredient: (itemId: string) => void;
  onUpdateIngredientQty: (itemId: string, qty: number) => void;
  onRemoveIngredient: (itemId: string) => void;
  onSaveRecipe: () => Promise<void>;
}

export const RecipesTab: React.FC<Props> = ({
  products,
  items,
  selectedProductId,
  currentRecipe,
  isSaving,
  onSelectProduct,
  onAddIngredient,
  onUpdateIngredientQty,
  onRemoveIngredient,
  onSaveRecipe,
}) => {
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Products Column */}
      <Card className="bg-slate-800/60 border-slate-700/60 rounded-2xl shadow-sm">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold text-white">Platos & Bebidas</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Selecciona un producto para configurar los insumos que descuenta al venderse.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {products.map((prod) => (
              <Button
                key={prod.id}
                variant="ghost"
                type="button"
                onClick={() => onSelectProduct(prod.id)}
                className={`w-full text-left px-3.5 py-2.5 h-auto rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                  selectedProductId === prod.id
                    ? 'bg-purple-600 text-white shadow hover:bg-purple-500'
                    : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="truncate">{prod.name}</span>
                <span className="font-mono text-[11px] opacity-75">
                  ${parseFloat(prod.price).toLocaleString()}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recipe Editor Column */}
      <Card className="md:col-span-2 bg-slate-800/60 border-slate-700/60 rounded-2xl shadow-sm">
        <CardHeader className="p-5 pb-4 border-b border-slate-800 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-bold text-white flex items-center space-x-2">
              <CookingPot className="w-4 h-4 text-purple-400" />
              <span>Ingredientes de la Receta (Escandallo)</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">{selectedProduct?.name || 'Selecciona un producto'}</CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => items.length > 0 && onAddIngredient(items[0].id)}
              disabled={!selectedProductId || items.length === 0}
              className="flex items-center space-x-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-3 py-1.5 h-auto rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Insumo</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onSaveRecipe}
              disabled={isSaving || !selectedProductId}
              className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-1.5 h-auto rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Receta'}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-4 space-y-3">
          {currentRecipe.map((ingredient, idx) => {
            const selectedItem = items.find((i) => i.id === ingredient.inventoryItemId);
            return (
              <Card key={idx} className="flex flex-row items-center space-x-3 bg-slate-900/60 border-slate-800 p-3 rounded-xl">
                <div className="flex-1 space-y-1">
                  <Label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Insumo</Label>
                  <span className="text-xs font-semibold text-white block truncate">{selectedItem?.name || ingredient.inventoryItemId}</span>
                </div>

                <div className="w-32 space-y-1">
                  <Label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Cantidad ({selectedItem?.unit || 'ud'})
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={ingredient.quantity}
                    onChange={(e) => onUpdateIngredientQty(ingredient.inventoryItemId, parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => onRemoveIngredient(ingredient.inventoryItemId)}
                    className="h-8 w-8 text-slate-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}

          {currentRecipe.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              Este producto no tiene ingredientes configurados en su receta.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
