import React, { useEffect, useState } from 'react';
import { Utensils, CheckCircle, XCircle, Search } from 'lucide-react';

interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: string;
  isAvailable: boolean;
  printerStation?: string;
}

interface Category {
  id: string;
  name: string;
  color?: string;
}

export const CatalogView: React.FC<{ venueId: string }> = ({ venueId }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const fetchCatalog = async () => {
    if (!venueId) return;
    try {
      const res = await fetch(`/api/venues/${venueId}/catalog`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [venueId]);

  const toggleAvailability = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/toggle-availability`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchCatalog();
      }
    } catch (err) {
      console.error('Error toggling product availability:', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.categoryId === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-10">
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
            Control de disponibilidad (86'd), precios y estaciones de cocina.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar plato en la carta..."
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
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
          Todas las categorías ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === c.id
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            {c.name} ({products.filter((p) => p.categoryId === c.id).length})
          </button>
        ))}
      </div>

      {/* Products Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => {
          const category = categories.find((c) => c.id === product.categoryId);

          return (
            <div
              key={product.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-md ${
                product.isAvailable
                  ? 'bg-slate-800/60 border-slate-700/60'
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
                </div>

                <h3 className="text-base font-bold text-white">{product.name}</h3>
                {product.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-base font-black text-orange-400">
                  ${parseFloat(product.price).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                  Estación: {product.printerStation === 'kitchen' ? '👨‍🍳 Cocina' : '🍹 Barra'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
