import { useState, useEffect, useCallback, useMemo } from 'react';
import { inventoryApi } from '../api/inventory.api';
import { Product, RecipeIngredient } from '../types/inventory.types';
import { toast } from '@/components/ui/sonner';

export const useRecipes = (venueId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [currentRecipe, setCurrentRecipe] = useState<RecipeIngredient[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [onlyTrackable, setOnlyTrackable] = useState(true);
  const [searchProductQuery, setSearchProductQuery] = useState('');

  const fetchCatalog = useCallback(async () => {
    if (!venueId) return;
    setLoadingProducts(true);
    try {
      const data = await inventoryApi.getCatalog(venueId);
      const prods: Product[] = (data?.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        trackInventory: Boolean(p.trackInventory),
        categoryId: p.categoryId,
        category: p.category,
        costPrice: p.costPrice,
        printerStation: p.printerStation,
      }));
      setProducts(prods);

      // Auto-select first trackable product if available
      const firstSelectable = prods.find((p) => p.trackInventory) || prods[0];
      if (firstSelectable && !selectedProductId) {
        setSelectedProductId(firstSelectable.id);
      }
    } catch (err) {
      console.error('Error fetching catalog for recipes:', err);
      toast.error('Error al cargar catálogo de productos');
    } finally {
      setLoadingProducts(false);
    }
  }, [venueId, selectedProductId]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const fetchRecipe = useCallback(async (prodId: string) => {
    if (!prodId || !venueId) return;
    setLoadingRecipe(true);
    try {
      const data = await inventoryApi.getRecipe(venueId, prodId);
      setCurrentRecipe(
        (data || []).map((r: any) => ({
          inventoryItemId: r.inventoryItemId,
          quantity: parseFloat(r.quantity) || 0,
        }))
      );
    } catch {
      setCurrentRecipe([]);
    } finally {
      setLoadingRecipe(false);
    }
  }, [venueId]);

  useEffect(() => {
    if (selectedProductId) {
      fetchRecipe(selectedProductId);
    }
  }, [selectedProductId, fetchRecipe]);

  // Filter products: show only products with trackInventory active (default), matching search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesTrack = onlyTrackable ? Boolean(p.trackInventory) : true;
      const matchesSearch = searchProductQuery
        ? p.name.toLowerCase().includes(searchProductQuery.toLowerCase())
        : true;
      return matchesTrack && matchesSearch;
    });
  }, [products, onlyTrackable, searchProductQuery]);

  // When changing filters, if current selected product is not visible, select first available
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const isCurrentInFiltered = filteredProducts.some((p) => p.id === selectedProductId);
      if (!isCurrentInFiltered) {
        setSelectedProductId(filteredProducts[0].id);
      }
    }
  }, [filteredProducts, selectedProductId]);

  const addIngredient = (inventoryItemId: string) => {
    if (!inventoryItemId) return;
    if (currentRecipe.some((r) => r.inventoryItemId === inventoryItemId)) {
      toast.warning('Este insumo ya se encuentra agregado en la receta');
      return;
    }
    setCurrentRecipe((prev) => [...prev, { inventoryItemId, quantity: 1 }]);
  };

  const updateIngredientItem = (index: number, newInventoryItemId: string) => {
    if (!newInventoryItemId) return;
    if (currentRecipe.some((r, i) => i !== index && r.inventoryItemId === newInventoryItemId)) {
      toast.warning('Ese insumo ya existe en otra línea de la receta');
      return;
    }
    setCurrentRecipe((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], inventoryItemId: newInventoryItemId };
      }
      return next;
    });
  };

  const updateIngredientQty = (index: number, quantity: number) => {
    setCurrentRecipe((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], quantity: Math.max(0, quantity) };
      }
      return next;
    });
  };

  const removeIngredient = (index: number) => {
    setCurrentRecipe((prev) => prev.filter((_, i) => i !== index));
  };

  const saveRecipe = async () => {
    if (!selectedProductId) {
      toast.error('Selecciona un producto para guardar su receta');
      return;
    }
    setIsSaving(true);
    try {
      await inventoryApi.saveRecipe(venueId, selectedProductId, currentRecipe);
      toast.success('Escandallo / Receta guardada exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar receta');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    products: filteredProducts,
    allProducts: products,
    selectedProductId,
    currentRecipe,
    loadingProducts,
    loadingRecipe,
    isSaving,
    onlyTrackable,
    searchProductQuery,
    setOnlyTrackable,
    setSearchProductQuery,
    setSelectedProductId,
    addIngredient,
    updateIngredientItem,
    updateIngredientQty,
    removeIngredient,
    saveRecipe,
    refreshCatalog: fetchCatalog,
  };
};
