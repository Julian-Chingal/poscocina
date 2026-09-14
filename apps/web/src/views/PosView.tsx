import React, { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Minus, Send, Check } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';

interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
  modifiers: Array<{ modifierId: string; priceDelta: number }>;
}

interface TableItem {
  id: string;
  label: string;
  status: string;
}

interface PosViewProps {
  venueId: string;
  selectedTable?: TableItem | null;
}

export const PosView: React.FC<PosViewProps> = ({ venueId, selectedTable }) => {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentTable, setCurrentTable] = useState<TableItem | null>(selectedTable || null);
  const [allTables, setAllTables] = useState<TableItem[]>([]);
  const [orderSentSuccess, setOrderSentSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!venueId) return;

    // Fetch catalog
    fetch(`/api/venues/${venueId}/catalog`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setProducts(data.products || []);
        if (data.categories?.length > 0) {
          setActiveCategoryId(data.categories[0].id);
        }
      });

    // Fetch tables for table selector
    fetch(`/api/venues/${venueId}/tables`)
      .then((res) => res.json())
      .then((data) => setAllTables(data || []));
  }, [venueId]);

  const filteredProducts = activeCategoryId
    ? products.filter((p) => p.categoryId === activeCategoryId)
    : products;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, notes: '', modifiers: [] }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  const handleSendOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);

    try {
      const payload = {
        venueId,
        tableId: currentTable?.id || null,
        orderType: currentTable ? 'dine_in' : 'takeout',
        waiterId: user?.id || null,
        guestCount: 1,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: parseFloat(item.product.price),
          notes: item.notes || undefined,
          modifiers: item.modifiers,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCart([]);
        setOrderSentSuccess(true);
        setTimeout(() => setOrderSentSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error creating order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden">
      {/* Left Column: Menu Catalog */}
      <div className="flex-1 flex flex-col border-r border-slate-800 bg-slate-900 overflow-hidden">
        {/* Category Tabs */}
        <div className="flex items-center space-x-2 p-4 border-b border-slate-800 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeCategoryId === cat.id
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="flex flex-col justify-between p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-orange-500/60 transition-all text-left group cursor-pointer shadow"
            >
              <div>
                <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">
                  {p.name}
                </h4>
                {p.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-extrabold text-orange-400">
                  ${parseFloat(p.price).toLocaleString()}
                </span>
                <span className="bg-slate-700 group-hover:bg-orange-600 p-1.5 rounded-lg text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Order Cart */}
      <div className="w-96 bg-slate-950 flex flex-col justify-between border-l border-slate-800">
        {/* Cart Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-white">Comanda Actual</span>
          </div>

          <select
            value={currentTable?.id || ''}
            onChange={(e) => {
              const selected = allTables.find((t) => t.id === e.target.value);
              setCurrentTable(selected || null);
            }}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500"
          >
            <option value="">Para Llevar</option>
            {allTables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} ({t.status === 'free' ? 'Libre' : 'Ocupada'})
              </option>
            ))}
          </select>
        </div>

        {/* Cart Items */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">
              Selecciona productos para iniciar la comanda
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col space-y-2"
              >
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-sm text-slate-200">{item.product.name}</span>
                  <span className="text-sm font-bold text-orange-400">
                    ${(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <input
                    type="text"
                    placeholder="Nota especial (ej. sin cebolla)"
                    value={item.notes}
                    onChange={(e) => {
                      const note = e.target.value;
                      setCart((prev) =>
                        prev.map((i) =>
                          i.product.id === item.product.id ? { ...i, notes: note } : i
                        )
                      );
                    }}
                    className="text-xs bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 w-44 focus:outline-none focus:border-slate-700"
                  />

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-white w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Action */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/60 space-y-4">
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (19%):</span>
              <span>${tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Total:</span>
              <span className="text-orange-400">${total.toLocaleString()}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0 || submitting}
            onClick={handleSendOrder}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
              orderSentSuccess
                ? 'bg-emerald-600 text-white'
                : cart.length > 0
                ? 'bg-orange-600 hover:bg-orange-500 text-white cursor-pointer shadow-lg shadow-orange-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {orderSentSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Comanda enviada a cocina!</span>
              </>
            ) : submitting ? (
              <span>Enviando...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Enviar Comanda a Cocina</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
