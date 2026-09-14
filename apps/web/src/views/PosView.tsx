import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Send,
  Check,
  CreditCard,
  DollarSign,
  Receipt,
  Printer,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useBrandingStore } from '../stores/branding.store';

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
  currentOrderId?: string | null;
}

interface PosViewProps {
  venueId: string;
  selectedTable?: TableItem | null;
}

export const PosView: React.FC<PosViewProps> = ({ venueId, selectedTable }) => {
  const { currentUser } = useAuthStore();
  const { settings } = useBrandingStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentTable, setCurrentTable] = useState<TableItem | null>(selectedTable || null);
  const [allTables, setAllTables] = useState<TableItem[]>([]);
  const [orderSentSuccess, setOrderSentSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Billing modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card_credit' | 'transfer'>('cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [cardReference, setCardReference] = useState<string>('');
  const [tipPct, setTipPct] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [receiptSuccess, setReceiptSuccess] = useState<any>(null);

  const fetchTables = () => {
    fetch(`/api/venues/${venueId}/tables`)
      .then((res) => res.json())
      .then((data) => setAllTables(data || []));
  };

  useEffect(() => {
    if (!venueId) return;

    fetch(`/api/venues/${venueId}/catalog`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setProducts(data.products || []);
        if (data.categories?.length > 0) {
          setActiveCategoryId(data.categories[0].id);
        }
      });

    fetchTables();
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

  const taxRate = typeof settings.taxRate === 'number' ? settings.taxRate : 0.08;
  const taxLabel = `${settings.taxRate === 0.19 ? 'IVA' : 'INC'} (${Math.round(taxRate * 100)}%):`;
  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
  const tax = subtotal * taxRate;
  const tipAmount = (subtotal * tipPct) / 100;
  const total = subtotal + tax + tipAmount;

  // Change / Vueltas
  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - total);

  const handleSendOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);

    try {
      const payload = {
        venueId,
        tableId: currentTable?.id || null,
        orderType: currentTable ? 'dine_in' : 'takeout',
        waiterId: currentUser?.id || null,
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
        const data = await res.json();
        setActiveOrderId(data.order.id);
        setOrderSentSuccess(true);
        setTimeout(() => setOrderSentSuccess(false), 3000);
        fetchTables();

        // Disparo ESC/POS de comanda a impresora de cocina
        fetch('/api/hardware/print-kitchen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.order.id }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Error creating order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCheckout = async () => {
    // If order not yet created in DB, create it first
    if (!activeOrderId && cart.length > 0) {
      setSubmitting(true);
      try {
        const payload = {
          venueId,
          tableId: currentTable?.id || null,
          orderType: currentTable ? 'dine_in' : 'takeout',
          waiterId: currentUser?.id || null,
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
          const data = await res.json();
          setActiveOrderId(data.order.id);
          setShowCheckoutModal(true);
        }
      } catch (err) {
        console.error('Error creating order before checkout:', err);
      } finally {
        setSubmitting(false);
      }
    } else {
      setShowCheckoutModal(true);
    }
  };

  const handleConfirmPayment = async () => {
    if (!activeOrderId) return;
    setProcessingPayment(true);

    try {
      const paymentPayload = {
        orderId: activeOrderId,
        payments: [
          {
            method: paymentMethod,
            amount: total,
            reference: cardReference || undefined,
            tipAmount,
          },
        ],
      };

      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload),
      });

      if (res.ok) {
        const data = await res.json();
        setReceiptSuccess(data.receipt);
        setCart([]);
        setActiveOrderId(null);
        fetchTables();

        // Disparo ESC/POS de ticket de venta al cliente
        fetch('/api/hardware/print-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiptId: data.receipt.id }),
        }).catch(() => {});

        // Si fue pago en efectivo, abrir automáticamente la gaveta de dinero
        if (paymentMethod === 'cash') {
          fetch('/api/hardware/open-drawer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ venueId }),
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Error issuing receipt:', err);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden">
      {/* Left Column: Menu Catalog */}
      <div className="flex-1 flex flex-col border-r border-slate-800 bg-slate-900 overflow-hidden">
        {/* Category Tabs */}
        <div className="flex items-center space-x-2 p-4 border-b border-slate-800 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all cursor-pointer ${
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

        {/* Cart Summary & Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/60 space-y-3">
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>{taxLabel}</span>
              <span>${tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Total:</span>
              <span className="text-orange-400">${total.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Action 1: Enviar a Cocina */}
            <button
              disabled={cart.length === 0 || submitting}
              onClick={handleSendOrder}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                orderSentSuccess
                  ? 'bg-emerald-600 text-white'
                  : cart.length > 0
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer border border-slate-700'
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>A Cocina</span>
            </button>

            {/* Action 2: Cobrar y Facturar */}
            <button
              disabled={cart.length === 0 || submitting}
              onClick={handleOpenCheckout}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                cart.length > 0
                  ? 'bg-orange-600 hover:bg-orange-500 text-white cursor-pointer shadow-lg shadow-orange-600/20'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Cobrar Orden</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Checkout & Multi-payment */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Caja & Facturación</span>
            </div>
            <h3 className="text-xl font-black text-white">Cobro de Orden</h3>
            <p className="text-xs text-slate-400 mb-5">
              Mesa: {currentTable?.label || 'Para Llevar'} • Comprobante Correlativo
            </p>

            {/* Breakdown */}
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal alimentos y bebidas:</span>
                <span className="font-mono text-slate-200">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{taxLabel}</span>
                <span className="font-mono text-slate-200">${tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 items-center pt-1 border-t border-slate-700/60">
                <span className="flex items-center space-x-2">
                  <span>Propina Voluntaria:</span>
                  <div className="flex space-x-1">
                    {[0, 5, 10].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTipPct(pct)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tipPct === pct
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </span>
                <span className="font-mono text-emerald-400">+${tipAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-700">
                <span>TOTAL A COBRAR:</span>
                <span className="font-mono text-orange-400">${total.toLocaleString()} {settings.currency || 'COP'}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Método de Pago:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'cash'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card_credit')}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'card_credit'
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Tarjeta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'transfer'
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    <span>Transferencia</span>
                  </button>
                </div>
              </div>

              {/* Cash Calculator */}
              {paymentMethod === 'cash' && (
                <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Efectivo Recibido:
                    </label>
                    <div className="flex space-x-1.5">
                      {[total, 50000, 100000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCashTendered(amt.toString())}
                          className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded-md"
                        >
                          ${amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-2 text-slate-400 text-sm font-bold">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {tenderedNum > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-slate-700">
                      <span className="text-slate-400">Cambio / Vueltas:</span>
                      <span className="font-mono text-emerald-400 text-sm">
                        ${changeDue.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Card / Transfer Reference */}
              {['card_credit', 'transfer'].includes(paymentMethod) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Número de Aprobación / Referencia:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. VOUCHER-9841 o Ref Nequi"
                    value={cardReference}
                    onChange={(e) => setCardReference(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Confirm Payment Button */}
            <div className="pt-6">
              <button
                disabled={processingPayment}
                onClick={handleConfirmPayment}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl text-sm transition-all shadow-xl shadow-orange-600/30 cursor-pointer flex items-center justify-center space-x-2"
              >
                <Check className="w-5 h-5" />
                <span>
                  {processingPayment
                    ? 'Emitiendo Comprobante & Descontando Stock...'
                    : `Confirmar Cobro ($${total.toLocaleString()})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Payment Receipt Confirmation */}
      {receiptSuccess && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">¡Pago Exitoso!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Comprobante #{receiptSuccess.receiptNumber} emitido.
              </p>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs space-y-1.5 text-left text-slate-300 font-mono">
              <div className="flex justify-between">
                <span>Total Cobrado:</span>
                <span className="font-bold text-white">${parseFloat(receiptSuccess.total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Mesa:</span>
                <span>Liberada (Libre)</span>
              </div>
              <div className="flex justify-between text-purple-400">
                <span>Insumos / Receta:</span>
                <span>Descontados del stock</span>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={() => {
                  setReceiptSuccess(null);
                  setShowCheckoutModal(false);
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
