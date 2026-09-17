import { useState, useEffect, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { catalogApi } from '../api/catalog.api';
import { Category, Product } from '../types/catalog.types';

export const useCatalogData = (venueId: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCatalog = useCallback(async () => {
    if (!venueId) return;
    try {
      setLoading(true);
      const data = await catalogApi.getCatalog(venueId);
      if (data) {
        setCategories(data.categories || []);
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchCatalog();

    const socket = io();
    const refresh = () => fetchCatalog();

    socket.on('catalog:category_created', refresh);
    socket.on('catalog:category_updated', refresh);
    socket.on('catalog:category_deleted', refresh);
    socket.on('catalog:product_created', refresh);
    socket.on('catalog:product_updated', refresh);
    socket.on('catalog:product_deleted', refresh);

    return () => {
      socket.disconnect();
    };
  }, [venueId, fetchCatalog]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = activeCategory === 'all' || p.categoryId === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, activeCategory, search]);

  return {
    categories,
    products,
    filteredProducts,
    activeCategory,
    search,
    loading,
    setActiveCategory,
    setSearch,
    refreshCatalog: fetchCatalog,
  };
};
