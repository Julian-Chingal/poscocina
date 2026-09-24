import { useState, useEffect, useMemo, useCallback } from 'react';
import { posApi } from '../api/pos.api';
import { Category, Product } from '../types/pos.types';

export const usePosCatalog = (venueId: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [productSearch, setProductSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCatalog = useCallback(async () => {
    if (!venueId) return;
    setIsError(false);
    setError(null);
    try {
      const data = await posApi.getCatalog(venueId);
      setCategories(data?.categories || []);
      setProducts(data?.products || []);
    } catch (err: any) {
      console.error('Error fetching catalog:', err);
      // Surface the error so the UI can show a retry button instead of
      // silently rendering an empty grid — which could trigger re-fetches.
      setIsError(true);
      setError(err instanceof Error ? err : new Error(err?.message ?? 'Error al cargar catálogo'));
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = activeCategoryId === 'all' || p.categoryId === activeCategoryId;
      const matchQuery = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [products, activeCategoryId, productSearch]);

  return {
    categories,
    products,
    filteredProducts,
    activeCategoryId,
    setActiveCategoryId,
    productSearch,
    setProductSearch,
    loading,
    isError,
    error,
    refreshCatalog: fetchCatalog,
  };
};

