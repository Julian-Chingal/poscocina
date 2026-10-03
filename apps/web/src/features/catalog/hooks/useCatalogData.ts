import { useState, useEffect, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { catalogApi } from '../api/catalog.api';
import { Category, Product } from '../types/catalog.types';

export const useCatalogData = (venueId: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'sold_out'>('all');
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

  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.isAvailable).length;
    const soldOut = total - available;
    return {
      total,
      available,
      soldOut,
      totalCategories: categories.length,
    };
  }, [products, categories]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCat = activeCategory === 'all' || p.categoryId === activeCategory;
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.description ? p.description.toLowerCase().includes(query) : false);
      const matchesAvailability =
        availabilityFilter === 'all'
          ? true
          : availabilityFilter === 'available'
          ? p.isAvailable
          : !p.isAvailable;
      return matchesCat && matchesSearch && matchesAvailability;
    });
  }, [products, activeCategory, search, availabilityFilter]);

  return {
    categories,
    products,
    filteredProducts,
    activeCategory,
    availabilityFilter,
    stats,
    search,
    loading,
    setActiveCategory,
    setAvailabilityFilter,
    setSearch,
    refreshCatalog: fetchCatalog,
  };
};
