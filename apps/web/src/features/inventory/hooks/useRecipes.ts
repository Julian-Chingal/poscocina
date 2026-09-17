import { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    if (!venueId) return;
    const fetchCatalog = async () => {
      try {
        const data = await inventoryApi.getCatalog(venueId);
        const prods = data?.products || [];
        setProducts(prods);
        if (prods.length > 0 && !selectedProductId) {
          setSelectedProductId(prods[0].id);
        }
      } catch (err) {
        console.error('Error fetching catalog for recipes:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchCatalog();
  }, [venueId]);

  const fetchRecipe = useCallback(async (prodId: string) => {
    if (!prodId || !venueId) return;
    setLoadingRecipe(true);
    try {
      const data = await inventoryApi.getRecipe(venueId, prodId);
      setCurrentRecipe(
        data.map((r: any) => ({
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

  const addIngredient = (inventoryItemId: string) => {
    if (currentRecipe.some((r) => r.inventoryItemId === inventoryItemId)) return;
    setCurrentRecipe((prev) => [...prev, { inventoryItemId, quantity: 1 }]);
  };

  const updateIngredientQty = (inventoryItemId: string, quantity: number) => {
    setCurrentRecipe((prev) =>
      prev.map((r) => (r.inventoryItemId === inventoryItemId ? { ...r, quantity } : r))
    );
  };

  const removeIngredient = (inventoryItemId: string) => {
    setCurrentRecipe((prev) => prev.filter((r) => r.inventoryItemId !== inventoryItemId));
  };

  const saveRecipe = async () => {
    if (!selectedProductId) return;
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
    products,
    selectedProductId,
    currentRecipe,
    loadingProducts,
    loadingRecipe,
    isSaving,
    setSelectedProductId,
    addIngredient,
    updateIngredientQty,
    removeIngredient,
    saveRecipe,
  };
};
