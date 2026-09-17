import { useState, useEffect, useMemo, useCallback } from 'react';
import { posApi } from '../api/pos.api';
import { Category, Product } from '../types/pos.types';

export const usePosCatalog = (venueId: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [productSearch, setProductSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchCatalog = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await posApi.getCatalog(venueId);
      setCategories(data?.categories || []);
      setProducts(data?.products || []);
    } catch (err) {
      console.error('Error fetching catalog:', err);
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
    refreshCatalog: fetchCatalog,
  };
};
