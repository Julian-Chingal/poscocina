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
  UtensilsCrossed,
  X,
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

  const defaultItemToAdd = availableItemsToAdd[0]?.id || '';

  const handleAddSelectedIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const idToAdd = selectedItemToAdd || defaultItemToAdd;
    if (!idToAdd) return;
    onAddIngredient(idToAdd);
    setSelectedItemToAdd('');
  };

  // Financial calculations for the selected recipe
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

  // Module wide stats
  const trackableCount = useMemo(() => {
    return products.filter((p) => p.trackInventory).length;
  }, [products]);

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* 1. Header Overview KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Platos en Menú
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <CookingPot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {allProductsCount || products.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
              Catálogo activo de venta
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Deducción de Inventario
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {trackableCount} <span className="text-sm font-semibold text-muted-foreground font-sans">platos</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Descuentan stock automáticamente al cobrar
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Insumos Disponibles
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground font-mono">
              {items.length} <span className="text-sm font-semibold text-muted-foreground font-sans">insumos</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500" />
              Para asociar a recetas de escandallo
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Products List (4 cols) */}
        <Card className="lg:col-span-4 rounded-2xl shadow-sm border-border/80 overflow-hidden">
          <CardHeader className="p-4 pb-3 border-b border-border/70 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-primary" />
                <span>Platos del Menú</span>
              </CardTitle>
              <Badge variant="outline" className="font-mono text-[10px] font-bold px-2 py-0.5">
                {products.length} {onlyTrackable ? 'con descuento' : 'totales'}
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Selecciona un plato para configurar su ficha técnica de insumos.
            </CardDescription>

            {/* Search & Trackable Filter Switch */}
            <div className="space-y-2 pt-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar plato..."
                  value={searchProductQuery}
                  onChange={(e) => onSearchProductChange(e.target.value)}
                  className="h-9 text-xs pl-9 pr-8 rounded-xl bg-background border-border/80"
                />
                {searchProductQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchProductChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 px-0.5">
                <Label htmlFor="track-filter" className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                  Solo platos con deducción activa
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
            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
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
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary'
                        : 'bg-card hover:bg-muted/40 border-border/80 text-foreground'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-extrabold truncate leading-snug">
                        {prod.name}
                      </span>
                      <span
                        className={`text-xs font-mono font-black shrink-0 ${
                          isSelected ? 'text-primary-foreground' : 'text-primary'
                        }`}
                      >
                        ${Math.round(priceNum).toLocaleString('es-CO')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1.5 text-[10px]">
                      <span
                        className={`truncate max-w-[130px] font-medium ${
                          isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}
                      >
                        {prod.category?.name || 'Menú Principal'}
                      </span>

                      {prod.trackInventory ? (
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isSelected ? 'text-primary-foreground' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Descuenta</span>
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isSelected ? 'text-primary-foreground/60' : 'text-muted-foreground/70'
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
                  <AlertCircle className="w-6 h-6 mx-auto opacity-40 text-amber-500" />
                  <p className="font-bold text-foreground">No hay platos disponibles</p>
                  <p className="text-[11px]">
                    {onlyTrackable
                      ? 'No se encontraron platos con "Descontar Inventario" activo.'
                      : 'No hay productos que coincidan con la búsqueda.'}
                  </p>
                  {onlyTrackable && allProductsCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSetOnlyTrackable(false)}
                      className="text-xs h-8 px-3 mt-2 rounded-xl"
                    >
                      Ver todos los platos ({allProductsCount})
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Recipe Editor & Financial Breakdown (8 cols) */}
        <Card className="lg:col-span-8 rounded-2xl shadow-sm border-border/80 overflow-hidden">
          {selectedProduct ? (
            <>
              {/* Product Header & Financial Highlights */}
              <div className="p-5 border-b border-border/70 bg-gradient-to-r from-muted/40 to-muted/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                        Ficha Técnica
                      </span>
                      {selectedProduct.category?.name && (
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {selectedProduct.category.name}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-foreground tracking-tight mt-1.5">
                      {selectedProduct.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      onClick={onSaveRecipe}
                      disabled={isSaving}
                      className="h-10 px-5 rounded-xl text-xs font-bold gap-2 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Guardando...' : 'Guardar Escandallo'}</span>
                    </Button>
                  </div>
                </div>

                {/* 4 Financial Highlight Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="p-3 bg-background border border-border/80 rounded-xl space-y-1 shadow-2xs">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                      Precio Carta
                    </span>
                    <span className="text-base font-black font-mono text-foreground block">
                      ${Math.round(sellingPrice).toLocaleString('es-CO')}
                    </span>
                  </div>

                  <div className="p-3 bg-background border border-border/80 rounded-xl space-y-1 shadow-2xs">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                      Costo Insumos
                    </span>
                    <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400 block">
                      ${Math.round(recipeTotalCost).toLocaleString('es-CO')}
                    </span>
                  </div>

                  <div className="p-3 bg-background border border-border/80 rounded-xl space-y-1 shadow-2xs">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                      Margen Bruto
                    </span>
                    <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                      ${Math.round(grossProfit).toLocaleString('es-CO')}{' '}
                      <span className="text-xs font-bold font-sans">({grossMarginPercent.toFixed(1)}%)</span>
                    </span>
                  </div>

                  <div className="p-3 bg-background border border-border/80 rounded-xl space-y-1 shadow-2xs">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                      Deducción POS
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{selectedProduct.trackInventory ? 'Automática' : 'Inactiva'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Add Insumo Row */}
              <div className="p-5 pb-4 border-b border-border/70 bg-muted/15">
                <form onSubmit={handleAddSelectedIngredient} className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 w-full space-y-1.5">
                    <Label htmlFor="insumo-select" className="text-xs font-bold text-foreground">
                      Añadir Insumo a la Receta
                    </Label>
                    <select
                      id="insumo-select"
                      value={selectedItemToAdd || defaultItemToAdd}
                      onChange={(e) => setSelectedItemToAdd(e.target.value)}
                      disabled={availableItemsToAdd.length === 0}
                      aria-label="Seleccionar insumo para añadir"
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary shadow-2xs font-medium"
                    >
                      {availableItemsToAdd.length === 0 ? (
                        <option value="">Todos los insumos del catálogo ya están agregados</option>
                      ) : (
                        availableItemsToAdd.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.unit}) — Costo unitario: ${parseFloat(item.costPerUnit || '0').toLocaleString('es-CO')}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={availableItemsToAdd.length === 0}
                    className="w-full sm:w-auto h-10 text-xs rounded-xl px-5 font-bold gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir a Receta</span>
                  </Button>
                </form>
              </div>

              {/* Ingredients List */}
              <CardContent className="p-5 space-y-3.5">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Insumos del Escandallo ({currentRecipe.length})</span>
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    Se deducen en tiempo real con cada orden despachada.
                  </span>
                </div>

                {currentRecipe.length === 0 ? (
                  <div className="text-center py-14 px-4 text-xs text-muted-foreground border border-dashed border-border/80 rounded-2xl space-y-2">
                    <Scale className="w-10 h-10 mx-auto opacity-30 text-primary" />
                    <p className="font-extrabold text-sm text-foreground">Escandallo sin ingredientes</p>
                    <p className="max-w-md mx-auto text-xs text-muted-foreground">
                      Este plato aún no tiene ingredientes asignados. Selecciona una materia prima en el selector superior y haz clic en "Añadir a Receta" para costearlo y activar la deducción automática.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {currentRecipe.map((ing, idx) => {
                      const currentItem = items.find((i) => i.id === ing.inventoryItemId);
                      const unitCost = parseFloat(currentItem?.costPerUnit || '0');
                      const lineCost = unitCost * (ing.quantity || 0);
                      const pctOfTotal = recipeTotalCost > 0 ? Math.round((lineCost / recipeTotalCost) * 100) : 0;

                      return (
                        <div
                          key={`${ing.inventoryItemId}-${idx}`}
                          className="p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/20 transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 group"
                        >
                          {/* Insumo Selector */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                              Insumo #{idx + 1}
                            </span>
                            <select
                              value={ing.inventoryItemId}
                              onChange={(e) => onUpdateIngredientItem(idx, e.target.value)}
                              aria-label={`Seleccionar insumo para la línea ${idx + 1}`}
                              className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary truncate font-bold text-foreground"
                            >
                              {items.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.unit}) — ${parseFloat(item.costPerUnit || '0').toLocaleString('es-CO')}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity Input with Unit */}
                          <div className="w-full sm:w-36 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground">
                              <span>Cantidad</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono font-bold">
                                {currentItem?.unit || 'und'}
                              </Badge>
                            </div>
                            <Input
                              type="number"
                              step="0.001"
                              min="0.0001"
                              placeholder="0.00"
                              value={ing.quantity || ''}
                              onChange={(e) => onUpdateIngredientQty(idx, parseFloat(e.target.value) || 0)}
                              className="h-9 text-xs font-mono font-bold rounded-lg"
                            />
                          </div>

                          {/* Line Cost & Contribution % */}
                          <div className="w-full sm:w-32 text-left sm:text-right shrink-0 space-y-0.5">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                              Costo Línea
                            </span>
                            <span className="text-xs font-mono font-black text-foreground block">
                              ${Math.round(lineCost).toLocaleString('es-CO')}
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground block">
                              {pctOfTotal}% del costo
                            </span>
                          </div>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => onRemoveIngredient(idx)}
                            className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 self-end sm:self-center transition"
                            title="Eliminar insumo de receta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <div className="p-16 text-center text-muted-foreground text-xs space-y-3">
              <CookingPot className="w-12 h-12 mx-auto opacity-30 text-primary" />
              <div className="space-y-1">
                <p className="text-base font-extrabold text-foreground">Ningún plato seleccionado</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Selecciona un plato en el panel izquierdo para editar o crear su ficha técnica de escandallo y fijar márgenes de ganancia.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RecipesTab;
