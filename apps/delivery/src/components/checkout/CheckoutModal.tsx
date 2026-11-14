'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Send,
  Loader2,
  MapPin,
  Compass,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { sileo } from 'sileo';

// Dynamically import map picker to avoid SSR issues with Leaflet
const DeliveryLocationPickerMap = dynamic(
  () => import('./DeliveryLocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-72 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-2 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
        <span>Cargando mapa interactivo...</span>
      </div>
    ),
  }
);

export function CheckoutModal() {
  const router = useRouter();
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    currentVenue,
    items,
    subtotal,
    total,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    barrio: '',
    address: '',
    notes: '',
    paymentMethod: 'cash' as 'cash' | 'transfer',
    cashPaymentAmount: '',
    deliveryNotes: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCheckoutOpen || !currentVenue) return null;

  const formatCOP = (num: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(num);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (currentVenue.isOpen === false) {
      setErrorMessage(
        'El restaurante se encuentra cerrado en este momento. ' +
          (currentVenue.openingHours ? `Horario: ${currentVenue.openingHours}. ` : '') +
          'No es posible confirmar pedidos a domicilio fuera del horario de atención.'
      );
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.barrio.trim()) {
      setErrorMessage('Por favor completa tu nombre, teléfono, barrio y dirección de entrega.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Tu carrito está vacío.');
      return;
    }

    setIsLoading(true);

    try {
      const fullAddress = `${formData.address.trim()} (Barrio: ${formData.barrio.trim()})`;
      const mapLink =
        formData.latitude && formData.longitude
          ? `https://maps.google.com/?q=${formData.latitude},${formData.longitude}`
          : null;

      const payload = {
        venueId: currentVenue.id,
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: fullAddress,
          notes: [
            `Barrio: ${formData.barrio.trim()}`,
            mapLink ? `GPS: ${mapLink}` : null,
            formData.notes.trim() || null,
          ]
            .filter(Boolean)
            .join(' | '),
        },
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          notes: i.notes,
          modifiers: i.modifiers,
        })),
        paymentMethod: formData.paymentMethod,
        cashPaymentAmount: formData.cashPaymentAmount
          ? parseFloat(formData.cashPaymentAmount)
          : undefined,
        deliveryNotes: [
          formData.deliveryNotes.trim() || null,
          mapLink ? `Ubicación GPS: ${mapLink}` : null,
        ]
          .filter(Boolean)
          .join(' | ') || undefined,
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

      sileo.success({
        title: '¡Pedido enviado!',
        description: 'Tu orden fue recibida y está siendo procesada.',
      });

      // Navigate to order tracking screen
      router.push(`/order-status/${createdOrder.order.id}`);
    } catch (err: any) {
      const msg = err.message || 'Ocurrió un error inesperado al enviar la orden.';
      setErrorMessage(msg);
      sileo.error({
        title: 'Error al procesar pedido',
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/80 backdrop-blur-md">
          <div>
            <h3 className="text-lg font-bold text-white">Finalizar Pedido</h3>
            <p className="text-xs text-orange-400 font-medium">
              Comercio: {currentVenue.restaurantName || currentVenue.name}
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-500/15 border border-red-500/30 p-3.5 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Personal Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Datos de Contacto
            </h4>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Juan Pérez"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Teléfono / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej: 3101234567"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>
          </div>

          {/* Delivery Address & Map */}
          <div className="space-y-3 border-t border-slate-800/80 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dirección de Entrega
              </h4>
              <button
                type="button"
                onClick={() => setShowMap((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/20 active:scale-95 transition"
              >
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                <span>{showMap ? 'Ocultar Mapa' : 'Seleccionar en Mapa'}</span>
              </button>
            </div>

            {/* Interactive Map Picker */}
            {showMap && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <DeliveryLocationPickerMap
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                  venueCoords={{
                    latitude: currentVenue.latitude,
                    longitude: currentVenue.longitude,
                  }}
                  onLocationSelect={({ latitude, longitude, suggestedAddress, suggestedBarrio }) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude,
                      longitude,
                      barrio: suggestedBarrio || prev.barrio,
                      address: suggestedAddress || prev.address,
                    }));
                    setShowMap(false);
                  }}
                  onClose={() => setShowMap(false)}
                />
              </div>
            )}

            {formData.latitude && formData.longitude && !showMap && (
              <div className="flex items-center justify-between rounded-xl bg-orange-500/10 border border-orange-500/20 px-3.5 py-2 text-xs text-orange-300">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
                  <span className="truncate">
                    Ubicación fijada ({formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="text-[11px] font-bold text-orange-400 underline hover:text-orange-300 shrink-0 ml-2"
                >
                  Cambiar punto
                </button>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Barrio / Sector *
                </label>
                <input
                  type="text"
                  required
                  value={formData.barrio}
                  onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
                  placeholder="Ej: Centro, Las Villas, San Agustín..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Dirección Exacta *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ej: Cra 15 # 85-30, Apto 501"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Indicaciones de Despacho (Opcional)
              </label>
              <input
                type="text"
                value={formData.deliveryNotes}
                onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                placeholder="Ej: Casa blanca de dos pisos, portón negro, timbre dañado"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>
          </div>

          {/* Payment Method: Efectivo & Transferencia (Datáfono retirado) */}
          <div className="space-y-3 border-t border-slate-800/80 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Método de Pago
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-xs font-semibold transition cursor-pointer ${
                  formData.paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-500/15 text-orange-200 shadow-sm'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Banknote className="h-6 w-6 mb-1.5 text-orange-400" />
                <span className="text-sm">Efectivo</span>
                <span className="text-[10px] text-slate-500 font-normal">Pagas al recibir</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'transfer' })}
                className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-xs font-semibold transition cursor-pointer ${
                  formData.paymentMethod === 'transfer'
                    ? 'border-orange-500 bg-orange-500/15 text-orange-200 shadow-sm'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Send className="h-6 w-6 mb-1.5 text-orange-400" />
                <span className="text-sm">Transferencia</span>
                <span className="text-[10px] text-slate-500 font-normal">Nequi / Bancolombia</span>
              </button>
            </div>

            {formData.paymentMethod === 'cash' && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ¿Con cuánto vas a pagar? (Para llevarte el cambio exacto)
                </label>
                <input
                  type="number"
                  value={formData.cashPaymentAmount}
                  onChange={(e) => setFormData({ ...formData, cashPaymentAmount: e.target.value })}
                  placeholder={`Ej: ${total}`}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none transition"
                />
              </div>
            )}

            {formData.paymentMethod === 'transfer' && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs text-slate-400 space-y-1 animate-in fade-in duration-200">
                <p className="font-semibold text-slate-300">Coordinación de Transferencia</p>
                <p>
                  Al enviar la orden, la sede te contactará por WhatsApp para confirmar y facilitarte los datos o código QR para tu pago.
                </p>
              </div>
            )}
          </div>

          {/* Payment Breakdown (Impuesto al consumo retirado por solicitud) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal ({items.length} {items.length === 1 ? 'producto' : 'productos'})</span>
              <span className="text-slate-200 font-medium">{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-black text-white">
              <span>Total a Pagar</span>
              <span className="text-orange-500 text-lg">{formatCOP(total)}</span>
            </div>
          </div>

          {currentVenue.isOpen === false && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>
                El comercio se encuentra cerrado en este momento.
                {currentVenue.openingHours && ` Horario: ${currentVenue.openingHours}.`}
              </span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading || currentVenue.isOpen === false}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-4 font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition text-sm cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Enviando Pedido...</span>
              </>
            ) : currentVenue.isOpen === false ? (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>Comercio Cerrado</span>
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
