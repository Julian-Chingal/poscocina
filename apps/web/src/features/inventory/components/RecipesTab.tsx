import React, { useState, useMemo } from 'react';
import {
  CookingPot,
  Plus,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Layers,
  Scale,
  Search,
} from 'lucide-react';
import { Product, InventoryItem, RecipeIngredient } from '../types/inventory.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface Props {
  products: Product[];
  allProductsCount?: number;
  items: InventoryItem[];
  selectedProductId: string;
  currentRecipe: RecipeIngredient[];
  isSaving: boolean;
  onlyTrackable: boolean;
  searchProductQuery: string;
  onSetOnlyTrackable: (b: boolean) => void;
  onSearchProductChange: (q: string) => void;
  onSelectProduct: (id: string) => void;
  onAddIngredient: (itemId: string) => void;
  onUpdateIngredientItem: (index: number, itemId: string) => void;
  onUpdateIngredientQty: (index: number, qty: number) => void;
  onRemoveIngredient: (index: number) => void;
  onSaveRecipe: () => Promise<void>;
}

export const RecipesTab: React.FC<Props> = ({
  products,
  allProductsCount = 0,
  items,
  selectedProductId,
  currentRecipe,
  isSaving,
  onlyTrackable,
  searchProductQuery,
  onSetOnlyTrackable,
  onSearchProductChange,
  onSelectProduct,
  onAddIngredient,
  onUpdateIngredientItem,
  onUpdateIngredientQty,
  onRemoveIngredient,
  onSaveRecipe,
}) => {
  const [selectedItemToAdd, setSelectedItemToAdd] = useState<string>('');

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Insumos available that are not yet in currentRecipe
  const availableItemsToAdd = useMemo(() => {
    const existingIds = new Set(currentRecipe.map((r) => r.inventoryItemId));
    return items.filter((i) => !existingIds.has(i.id));
  }, [items, currentRecipe]);

  // Update selectedItemToAdd if current selection is invalid
  const defaultItemToAdd = availableItemsToAdd[0]?.id || '';

  const handleAddSelectedIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const idToAdd = selectedItemToAdd || defaultItemToAdd;
    if (!idToAdd) return;
    onAddIngredient(idToAdd);
    setSelectedItemToAdd('');
  };

  // Calculations for recipe cost and profit margin
  const sellingPrice = parseFloat(selectedProduct?.price || '0');

  const recipeTotalCost = useMemo(() => {
    return currentRecipe.reduce((sum, ing) => {
      const invItem = items.find((i) => i.id === ing.inventoryItemId);
      const unitCost = parseFloat(invItem?.costPerUnit || '0');
      return sum + unitCost * (ing.quantity || 0);
    }, 0);
  }, [currentRecipe, items]);

  const grossProfit = sellingPrice - recipeTotalCost;
  const grossMarginPercent = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;

  return (
    <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Products List (4 cols) */}
      <Card className="lg:col-span-4 rounded-2xl shadow-sm border-border overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <CookingPot className="size-4 text-primary" />
              <span>Platos con Escandallo</span>
            </CardTitle>
            <Badge variant="outline" className="font-mono text-xs">
              {products.length} {onlyTrackable ? 'descontables' : 'totales'}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Selecciona un plato para configurar su ficha técnica de insumos.
          </CardDescription>

          {/* Search & Trackable Filter Switch */}
          <div className="pt-2 space-y-2">
            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar plato..."
                value={searchProductQuery}
                onChange={(e) => onSearchProductChange(e.target.value)}
                className="h-8 text-xs pl-8 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <Label htmlFor="track-filter" className="text-[11px] font-medium text-muted-foreground cursor-pointer">
                Solo con descuento de inventario
              </Label>
              <Switch
                id="track-filter"
                checked={onlyTrackable}
                onCheckedChange={onSetOnlyTrackable}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3">
          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {products.map((prod) => {
              const isSelected = prod.id === selectedProductId;
              const priceNum = parseFloat(prod.price || '0');

              return (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectProduct(prod.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs ring-1 ring-primary'
                      : 'bg-card hover:bg-muted/40 border-border/80 text-foreground'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="text-xs font-bold truncate leading-snug">
                      {prod.name}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold shrink-0 ${
                        isSelected ? 'text-primary-foreground' : 'text-primary'
                      }`}
                    >
                      ${priceNum.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span
                      className={`truncate max-w-[130px] ${
                        isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}
                    >
                      {prod.category?.name || 'Menú'}
                    </span>

                    {prod.trackInventory ? (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          isSelected ? 'text-primary-foreground' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        <CheckCircle2 className="size-2.5" />
                        <span>Descuenta</span>
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isSelected ? 'text-primary-foreground/60' : 'text-muted-foreground'
                        }`}
                      >
                        Sin descuento
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {products.length === 0 && (
              <div className="text-center py-10 px-4 text-xs text-muted-foreground border border-dashed rounded-xl space-y-2">
                <AlertCircle className="size-6 mx-auto opacity-40 text-amber-500" />
                <p className="font-semibold">No hay platos disponibles</p>
                <p className="text-[11px]">
                  {onlyTrackable
                    ? 'No se encontraron platos con "Descontar Inventario" activo en el Catálogo.'
                    : 'No hay productos que coincidan con la búsqueda.'}
                </p>
                {onlyTrackable && allProductsCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSetOnlyTrackable(false)}
                    className="text-[11px] h-7 px-2 mt-2 rounded-lg"
                  >
                    Ver todos los platos ({allProductsCount})
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Column: Recipe Editor & Selected Product Showcase (8 cols) */}
      <Card className="lg:col-span-8 rounded-2xl shadow-sm border-border overflow-hidden">
        {selectedProduct ? (
          <>
            {/* Selected Product Banner Header */}
            <div className="p-5 border-b border-border bg-gradient-to-r from-muted/30 to-muted/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      Plato Seleccionado
                    </span>
                    {selectedProduct.category?.name && (
                      <Badge variant="outline" className="text-[10px]">
                        {selectedProduct.category.name}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold text-foreground tracking-tight mt-1">
                    {selectedProduct.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    onClick={onSaveRecipe}
                    disabled={isSaving}
                    className="h-9 px-4 rounded-xl text-xs font-bold gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Save className="size-3.5" />
                    <span>{isSaving ? 'Guardando...' : 'Guardar Receta'}</span>
                  </Button>
                </div>
              </div>

              {/* Status and Analytics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <Card className="p-2.5 bg-background/80 border-border/80 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Precio Venta
                  </span>
                  <span className="text-sm font-extrabold font-mono text-foreground">
                    ${sellingPrice.toLocaleString()}
                  </span>
                </Card>

                <Card className="p-2.5 bg-background/80 border-border/80 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Costo Insumos
                  </span>
                  <span className="text-sm font-extrabold font-mono text-amber-600 dark:text-amber-400">
                    ${Math.round(recipeTotalCost).toLocaleString()}
                  </span>
                </Card>

                <Card className="p-2.5 bg-background/80 border-border/80 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Margen Estimado
                  </span>
                  <span className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    ${Math.round(grossProfit).toLocaleString()} ({grossMarginPercent.toFixed(1)}%)
                  </span>
                </Card>

                <Card className="p-2.5 bg-background/80 border-border/80 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Deducción Auto
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>{selectedProduct.trackInventory ? 'Habilitada' : 'Inactiva'}</span>
                  </span>
                </Card>
              </div>
            </div>

            {/* Insumo Adder Section */}
            <div className="p-5 pb-3 border-b border-border bg-muted/10">
              <form onSubmit={handleAddSelectedIngredient} className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="flex-1 w-full space-y-1">
                  <Label htmlFor="insumo-select" className="text-xs font-semibold text-foreground">
                    Seleccionar Insumo del Inventario para Añadir
                  </Label>
                  <select
                    id="insumo-select"
                    value={selectedItemToAdd || defaultItemToAdd}
                    onChange={(e) => setSelectedItemToAdd(e.target.value)}
                    disabled={availableItemsToAdd.length === 0}
                    aria-label="Seleccionar insumo para añadir"
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary shadow-xs"
                  >
                    {availableItemsToAdd.length === 0 ? (
                      <option value="">Todos los insumos disponibles ya han sido agregados</option>
                    ) : (
                      availableItemsToAdd.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.unit}) — Stock: {item.currentStock} — Costo: ${parseFloat(item.costPerUnit || '0').toLocaleString()}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={availableItemsToAdd.length === 0}
                  className="w-full sm:w-auto h-9 text-xs rounded-xl px-4 font-bold gap-1.5 self-end shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span>Añadir Insumo</span>
                </Button>
              </form>
            </div>

            {/* Ingredients Table / List */}
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="size-3.5" />
                  <span>Insumos a Descontar ({currentRecipe.length})</span>
                </h4>
                <span className="text-[11px] text-muted-foreground">
                  Se deducen automáticamente tras el cierre y cobro de cada comanda.
                </span>
              </div>

              {currentRecipe.length === 0 ? (
                <div className="text-center py-12 px-4 text-xs text-muted-foreground border border-dashed rounded-xl space-y-2">
                  <Scale className="size-8 mx-auto opacity-30 text-primary" />
                  <p className="font-bold text-sm text-foreground">Receta vacía</p>
                  <p className="max-w-md mx-auto text-[11px]">
                    Este plato aún no tiene ingredientes asociados. Selecciona un insumo en el selector de arriba y presiona "Añadir Insumo" para empezar a costearlo y descontarlo.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentRecipe.map((ing, idx) => {
                    const currentItem = items.find((i) => i.id === ing.inventoryItemId);
                    const unitCost = parseFloat(currentItem?.costPerUnit || '0');
                    const lineCost = unitCost * (ing.quantity || 0);

                    return (
                      <Card
                        key={`${ing.inventoryItemId}-${idx}`}
                        className="p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/20 transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                      >
                        {/* Insumo Selector */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                            Insumo #{idx + 1}
                          </Label>
                          <select
                            value={ing.inventoryItemId}
                            onChange={(e) => onUpdateIngredientItem(idx, e.target.value)}
                            aria-label={`Seleccionar insumo para la línea ${idx + 1}`}
                            className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary truncate font-medium"
                          >
                            {items.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.unit}) — Costo unitario: ${parseFloat(item.costPerUnit || '0').toLocaleString()}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Input */}
                        <div className="w-full sm:w-36 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground">
                            <span>Cantidad</span>
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                              {currentItem?.unit || 'ud'}
                            </Badge>
                          </div>
                          <Input
                            type="number"
                            step="0.001"
                            min="0.0001"
                            placeholder="0.00"
                            value={ing.quantity || ''}
                            onChange={(e) => onUpdateIngredientQty(idx, parseFloat(e.target.value) || 0)}
                            className="h-8 text-xs font-mono rounded-lg"
                          />
                        </div>

                        {/* Cost preview */}
                        <div className="w-full sm:w-28 text-left sm:text-right shrink-0 space-y-0.5">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                            Costo Línea
                          </span>
                          <span className="text-xs font-mono font-bold text-foreground block">
                            ${Math.round(lineCost).toLocaleString()}
                          </span>
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => onRemoveIngredient(idx)}
                          className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 self-end sm:self-center"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
            <CookingPot className="size-10 mx-auto opacity-30 text-primary" />
            <p className="text-sm font-bold text-foreground">Ningún plato seleccionado</p>
            <p>Selecciona un plato de la lista izquierda para ver o crear su receta de escandallo.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RecipesTab;
