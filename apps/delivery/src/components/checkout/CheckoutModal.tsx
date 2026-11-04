'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2, AlertCircle, Banknote, CreditCard, Send, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function CheckoutModal() {
  const router = useRouter();
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    currentVenue,
    items,
    subtotal,
    taxTotal,
    total,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'cash' as 'cash' | 'transfer' | 'card_on_delivery',
    cashPaymentAmount: '',
    deliveryNotes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCheckoutOpen || !currentVenue) return null;

  const formatCOP = (num: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMessage('Por favor completa tu nombre, teléfono y dirección de entrega.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Tu carrito está vacío.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        venueId: currentVenue.id,
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          notes: formData.notes.trim() || undefined,
        },
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          notes: i.notes,
          modifiers: i.modifiers,
        })),
        paymentMethod: formData.paymentMethod,
        cashPaymentAmount: formData.cashPaymentAmount ? parseFloat(formData.cashPaymentAmount) : undefined,
        deliveryNotes: formData.deliveryNotes.trim() || undefined,
      };

      const res = await fetch('/api/public/orders/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al procesar el pedido. Intenta nuevamente.');
      }

      const createdOrder = await res.json();
      clearCart();
      setIsCheckoutOpen(false);

      // Navigate to order tracking screen
      router.push(`/order-status/${createdOrder.order.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error inesperado al enviar la orden.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-white">Finalizar Pedido</h3>
            <p className="text-xs text-orange-400 font-medium">Sede: {currentVenue.name}</p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-500/30 p-3 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Personal Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Datos de Contacto</h4>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Juan Pérez"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Teléfono / WhatsApp *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej: 3101234567"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3 border-t border-slate-800/80 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dirección de Entrega</h4>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Dirección Exacta *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ej: Carrera 15 # 85-30, Apto 501"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Indicaciones de Despacho (Opcional)</label>
              <input
                type="text"
                value={formData.deliveryNotes}
                onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                placeholder="Ej: Dejar en portería, torre 2, timbre no funciona"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3 border-t border-slate-800/80 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Método de Pago</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-semibold transition ${
                  formData.paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-500/15 text-orange-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Banknote className="h-5 w-5 mb-1 text-orange-400" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'transfer' })}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-semibold transition ${
                  formData.paymentMethod === 'transfer'
                    ? 'border-orange-500 bg-orange-500/15 text-orange-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Send className="h-5 w-5 mb-1 text-orange-400" />
                <span>Transferencia</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'card_on_delivery' })}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-semibold transition ${
                  formData.paymentMethod === 'card_on_delivery'
                    ? 'border-orange-500 bg-orange-500/15 text-orange-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <CreditCard className="h-5 w-5 mb-1 text-orange-400" />
                <span>Datáfono</span>
              </button>
            </div>

            {formData.paymentMethod === 'cash' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">¿Con cuánto vas a pagar? (Para cambio)</label>
                <input
                  type="number"
                  value={formData.cashPaymentAmount}
                  onChange={(e) => setFormData({ ...formData, cashPaymentAmount: e.target.value })}
                  placeholder={`Ej: ${total}`}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Total Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal ({items.length} productos)</span>
              <span className="text-slate-200">{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Impuesto al Consumo (INC)</span>
              <span className="text-slate-200">{formatCOP(taxTotal)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-black text-white">
              <span>Total a Pagar</span>
              <span className="text-orange-500">{formatCOP(total)}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3.5 font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 disabled:opacity-50 transition text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Enviando Comanda a Cocina...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Enviar Pedido • {formatCOP(total)}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
