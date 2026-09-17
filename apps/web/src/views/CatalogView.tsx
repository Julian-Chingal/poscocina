import React, { useEffect, useState } from 'react';
import {
  Utensils,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Printer,
  DollarSign,
  Layers,
  Clock,
  Boxes,
  AlertTriangle,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/auth.store';
import { usePermissions } from '../hooks/usePermissions';
import { api } from '../services/api';

interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: string | number;
  taxRate?: string | number;
  imageUrl?: string | null;
  printerStation?: string | null;
  prepTimeMin?: number | null;
  trackInventory?: boolean;
  isAvailable: boolean;
  sortOrder?: number;
}

interface Category {
  id: string;
  venueId?: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  printerStation?: string | null;
  sortOrder?: number;
}

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
];

export const CatalogView: React.FC<{ venueId: string }> = ({ venueId }) => {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#3b82f6',
    printerStation: 'kitchen',
    sortOrder: 0,
  });

  // Product Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: '',
    price: '',
    taxRate: 0.08,
    printerStation: 'kitchen',
    description: '',
    prepTimeMin: 15,
    trackInventory: false,
    isAvailable: true,
  });

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'category' | 'product';
    id: string;
    name: string;
  } | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { isManager } = usePermissions();

  const fetchCatalog = async () => {
    if (!venueId) return;
    try {
      setLoading(true);
      const data = await api.get(`/api/venues/${venueId}/catalog`);
      if (data) {
        setCategories(data.categories || []);
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

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
  }, [venueId]);

  const toggleAvailability = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/toggle-availability`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchCatalog();
      }
    } catch (err) {
      console.error('Error toggling product availability:', err);
    }
  };

  // Category handlers
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      color: '#3b82f6',
      printerStation: 'kitchen',
      sortOrder: categories.length,
    });
    setFormError(null);
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      color: cat.color || '#3b82f6',
      printerStation: cat.printerStation || 'kitchen',
      sortOrder: cat.sortOrder || 0,
    });
    setFormError(null);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      setFormError('El nombre de la categoría es obligatorio.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const url = editingCategory
        ? `/api/venues/${venueId}/categories/${editingCategory.id}`
        : `/api/venues/${venueId}/categories`;
      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryForm),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al guardar categoría');
      }

      setShowCategoryModal(false);
      fetchCatalog();
    } catch (err: any) {
      setFormError(err.message || 'Ocurrió un error');
    } finally {
      setSubmitting(false);
    }
  };

  // Product handlers
  const openCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      categoryId: activeCategory !== 'all' ? activeCategory : categories[0]?.id || '',
      price: '',
      taxRate: 0.08,
      printerStation: 'kitchen',
      description: '',
      prepTimeMin: 15,
      trackInventory: false,
      isAvailable: true,
    });
    setFormError(null);
    setShowProductModal(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      categoryId: prod.categoryId,
      price: prod.price ? String(prod.price) : '',
      taxRate: prod.taxRate !== undefined && prod.taxRate !== null ? Number(prod.taxRate) : 0.08,
      printerStation: prod.printerStation || 'kitchen',
      description: prod.description || '',
      prepTimeMin: prod.prepTimeMin || 15,
      trackInventory: prod.trackInventory ?? false,
      isAvailable: prod.isAvailable,
    });
    setFormError(null);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      setFormError('El nombre del producto es obligatorio.');
      return;
    }
    if (!productForm.categoryId) {
      setFormError('Debes seleccionar una categoría.');
      return;
    }
    const numPrice = parseFloat(productForm.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Ingresa un precio válido mayor a 0.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = {
        categoryId: productForm.categoryId,
        name: productForm.name.trim(),
        price: numPrice,
        taxRate: productForm.taxRate,
        printerStation: productForm.printerStation,
        description: productForm.description.trim() || undefined,
        prepTimeMin: Number(productForm.prepTimeMin) || 0,
        trackInventory: productForm.trackInventory,
        isAvailable: productForm.isAvailable,
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al guardar producto');
      }

      setShowProductModal(false);
      fetchCatalog();
    } catch (err: any) {
      setFormError(err.message || 'Ocurrió un error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handler
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      const url =
        deleteTarget.type === 'category'
          ? `/api/venues/${venueId}/categories/${deleteTarget.id}`
          : `/api/products/${deleteTarget.id}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al eliminar');
      }

      setDeleteTarget(null);
      if (deleteTarget.type === 'category' && activeCategory === deleteTarget.id) {
        setActiveCategory('all');
      }
      fetchCatalog();
    } catch (err: any) {
      alert(`No se pudo eliminar: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.categoryId === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Utensils className="w-3.5 h-3.5" />
            <span>Gestión Gastronómica</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Menú, Platos y Precios
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Configuración de catálogo, impuestos (INC 8% / IVA 19%), disponibilidad y estaciones.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar plato..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {isManager && (
            <button
              onClick={openCreateProduct}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-blue-500/20 transition cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          Todas ({products.length})
        </button>

        {categories.map((c) => (
          <div
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`group relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === c.id
                ? 'bg-slate-800 border-blue-500 text-white shadow'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: c.color || '#3b82f6' }}
            />
            <span>
              {c.name} ({products.filter((p) => p.categoryId === c.id).length})
            </span>

            {isManager && (
              <div className="flex items-center space-x-1 pl-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={(e) => openEditCategory(c, e)}
                  title="Editar categoría"
                  className="p-1 hover:text-blue-400 rounded transition"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({ type: 'category', id: c.id, name: c.name });
                  }}
                  title="Eliminar categoría"
                  className="p-1 hover:text-rose-400 rounded transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}

        {isManager && (
          <button
            onClick={openCreateCategory}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Categoría</span>
          </button>
        )}
      </div>

      {/* Products Grid */}
      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-slate-400 animate-spin text-2xl">⏳</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500">
          <Utensils className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No se encontraron productos en este catálogo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const category = categories.find((c) => c.id === product.categoryId);
            const taxPercent = product.taxRate ? Number(product.taxRate) * 100 : 8;

            return (
              <div
                key={product.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-md relative group ${
                  product.isAvailable
                    ? 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                    : 'bg-slate-900/40 border-slate-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${category?.color || '#3b82f6'}20`,
                        color: category?.color || '#60a5fa',
                      }}
                    >
                      {category?.name || 'Categoría'}
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleAvailability(product.id)}
                        className={`flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          product.isAvailable
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/60'
                            : 'bg-rose-950/60 border-rose-500/50 text-rose-400 hover:bg-rose-900/60'
                        }`}
                      >
                        {product.isAvailable ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Disponible</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Agotado (86)</span>
                          </>
                        )}
                      </button>

                      {isManager && (
                        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={() => openEditProduct(product)}
                            title="Editar producto"
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: 'product',
                                id: product.id,
                                name: product.name,
                              })
                            }
                            title="Eliminar producto"
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-base font-black text-orange-400">
                      ${Number(product.price).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-medium">
                      ({taxPercent === 8 ? 'INC 8%' : taxPercent === 19 ? 'IVA 19%' : 'Exento'})
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {product.trackInventory && (
                      <span
                        title="Control de inventario activo"
                        className="text-[10px] text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-800/50 flex items-center space-x-1"
                      >
                        <Boxes className="w-3 h-3" />
                        <span>Receta</span>
                      </span>
                    )}
                    <span className="text-[11px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 flex items-center space-x-1">
                      <Printer className="w-3 h-3 text-slate-400" />
                      <span>{product.printerStation === 'bar' ? 'Barra' : 'Cocina'}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</span>
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre de la categoría *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Ej. Entradas, Platos Fuertes, Bebidas..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Color distintivo
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, color: col })}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        categoryForm.color === col
                          ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Estación de Preparación Predeterminada
                </label>
                <select
                  value={categoryForm.printerStation}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, printerStation: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="kitchen">Cocina Principal</option>
                  <option value="bar">Barra de Bebidas</option>
                  <option value="dessert">Repostería / Postres</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-blue-400" />
                <span>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</span>
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre del Plato / Producto *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Ej. Hamburguesa Clásica"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) =>
                      setProductForm({ ...productForm, categoryId: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Precio de Venta (COP) *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="number"
                      step="100"
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="35000"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Régimen Tributario (Impuestos Colombia)
                  </label>
                  <select
                    value={productForm.taxRate}
                    onChange={(e) =>
                      setProductForm({ ...productForm, taxRate: parseFloat(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={0.08}>INC 8% (Impuesto Nacional al Consumo - Estándar)</option>
                    <option value={0.19}>IVA 19% (Licores cerrados / Mercancía)</option>
                    <option value={0.0}>0% Exento (Agua o bienes sin gravamen)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estación de Comanda / Impresión
                  </label>
                  <select
                    value={productForm.printerStation}
                    onChange={(e) =>
                      setProductForm({ ...productForm, printerStation: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="kitchen">Cocina Principal (KDS)</option>
                    <option value="bar">Barra de Bebidas (Bar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tiempo estimado preparación (min)
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="number"
                      min="0"
                      value={productForm.prepTimeMin}
                      onChange={(e) =>
                        setProductForm({ ...productForm, prepTimeMin: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción del plato / Ingredientes
                </label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  placeholder="200g carne Angus, queso cheddar fundido, tocineta ahumada..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.trackInventory}
                    onChange={(e) =>
                      setProductForm({ ...productForm, trackInventory: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-300">
                    Descontar insumos por receta (Inventario)
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isAvailable}
                    onChange={(e) =>
                      setProductForm({ ...productForm, isAvailable: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-300">
                    Disponible en la carta
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              ¿Eliminar {deleteTarget.type === 'category' ? 'categoría' : 'producto'}?
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Estás a punto de eliminar <span className="text-white font-semibold">"{deleteTarget.name}"</span>. Esta acción no se puede deshacer.
            </p>

            <div className="flex space-x-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
