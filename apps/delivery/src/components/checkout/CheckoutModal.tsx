'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Send,
  Loader2,
  MapPin,
} from 'lucide-react';
import {
  VStack,
  HStack,
  Grid,
  Text,
  Heading,
  Button,
  Card,
  TextInput,
  NumberInput,
} from '@astryxdesign/core';
import { useCart } from '../../context/CartContext';
import { sileo } from 'sileo';

// Dynamically import map picker to avoid SSR issues with Leaflet
const DeliveryLocationPickerMap = dynamic(
  () => import('./DeliveryLocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <VStack className="w-full h-72 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-2 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
        <Text className="text-xs text-slate-400">Cargando mapa interactivo...</Text>
      </VStack>
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
  const { customer } = useCustomerAuth();

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

  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || customer.name || '',
        phone: prev.phone || customer.phone || '',
        address: prev.address || customer.address || '',
      }));
    }
  }, [customer]);

  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCheckoutOpen || !currentVenue) return null;

  const formatCOP = (num: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);

  const deliveryFee = 5000;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('La canasta está vacía.');
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.barrio.trim()) {
      setErrorMessage('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    if (formData.paymentMethod === 'cash' && formData.cashPaymentAmount) {
      const amount = parseFloat(formData.cashPaymentAmount);
      if (isNaN(amount) || amount < grandTotal) {
        setErrorMessage(`El monto con el que vas a pagar debe ser mayor o igual al total (${formatCOP(grandTotal)}).`);
        return;
      }
    }

    setIsLoading(true);

    try {
      const fullAddress = `${formData.address.trim()}, Barrio ${formData.barrio.trim()}`;
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

      const res = await fetch('/api/orders/checkout', {
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
    <VStack className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <VStack className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl">
        {/* Header */}
        <HStack className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/80 backdrop-blur-md w-full">
          <VStack>
            <Heading level={3} className="text-lg font-bold text-white">Finalizar Pedido</Heading>
            <Text className="text-xs text-orange-400 font-medium block">
              Comercio: {currentVenue.restaurantName || currentVenue.name}
            </Text>
          </VStack>
          <Button
            label="Cerrar modal"
            onClick={() => setIsCheckoutOpen(false)}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </HStack>

        {/* Form Body */}
        <VStack as="form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar w-full">
          {errorMessage && (
            <Card className="flex items-center gap-2 rounded-2xl bg-red-500/15 border border-red-500/30 p-3.5 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 inline mr-2" />
              <Text className="text-red-200 text-xs">{errorMessage}</Text>
            </Card>
          )}

          {/* Personal Info */}
          <VStack className="space-y-3 w-full">
            <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Datos de Contacto
            </Heading>
            <VStack className="w-full">
              <TextInput
                label="Nombre Completo *"
                value={formData.name}
                onChange={(val) => setFormData({ ...formData, name: val })}
                placeholder="Ej: Juan Pérez"
                width="100%"
                controlClassName="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
              />
            </VStack>
            <VStack className="w-full">
              <TextInput
                type="tel"
                label="Teléfono / WhatsApp *"
                value={formData.phone}
                onChange={(val) => setFormData({ ...formData, phone: val })}
                placeholder="Ej: 3101234567"
                width="100%"
                controlClassName="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
              />
            </VStack>
          </VStack>

          {/* Delivery Address & Map */}
          <VStack className="space-y-3 border-t border-slate-800/80 pt-4 w-full">
            <HStack className="flex items-center justify-between w-full">
              <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dirección de Entrega
              </Heading>
              <Button
                label={showMap ? 'Ocultar Mapa' : 'Seleccionar en Mapa'}
                type="button"
                onClick={() => setShowMap((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/20 active:scale-95 transition cursor-pointer"
              >
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                <Text weight="bold" className="text-xs text-orange-400">
                  {showMap ? 'Ocultar Mapa' : 'Seleccionar en Mapa'}
                </Text>
              </Button>
            </HStack>

            {/* Interactive Map Picker */}
            {showMap && (
              <VStack className="animate-in fade-in zoom-in-95 duration-200 w-full">
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
              </VStack>
            )}

            {formData.latitude && formData.longitude && !showMap && (
              <HStack className="flex items-center justify-between rounded-xl bg-orange-500/10 border border-orange-500/20 px-3.5 py-2 text-xs text-orange-300 w-full">
                <HStack className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
                  <Text className="truncate text-xs text-orange-300">
                    Ubicación fijada ({formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)})
                  </Text>
                </HStack>
                <Button
                  label="Cambiar punto en mapa"
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="text-[11px] font-bold text-orange-400 underline hover:text-orange-300 shrink-0 ml-2 cursor-pointer p-0 bg-transparent border-none"
                >
                  <Text weight="bold" className="text-xs text-orange-400">Cambiar punto</Text>
                </Button>
              </HStack>
            )}

            <Grid className="grid gap-3 sm:grid-cols-2 w-full">
              <VStack className="w-full">
                <TextInput
                  label="Barrio / Sector *"
                  value={formData.barrio}
                  onChange={(val) => setFormData({ ...formData, barrio: val })}
                  placeholder="Ej: Centro, Las Villas, San Agustín..."
                  width="100%"
                  controlClassName="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
                />
              </VStack>

              <VStack className="w-full">
                <TextInput
                  label="Dirección Exacta *"
                  value={formData.address}
                  onChange={(val) => setFormData({ ...formData, address: val })}
                  placeholder="Ej: Cra 15 # 85-30, Apto 501"
                  width="100%"
                  controlClassName="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
                />
              </VStack>
            </Grid>

            <VStack className="w-full">
              <TextInput
                label="Indicaciones de Despacho (Opcional)"
                value={formData.deliveryNotes}
                onChange={(val) => setFormData({ ...formData, deliveryNotes: val })}
                placeholder="Ej: Casa blanca de dos pisos, portón negro, timbre dañado"
                width="100%"
                controlClassName="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
              />
            </VStack>
          </VStack>

          {/* Payment Method: Efectivo & Transferencia */}
          <VStack className="space-y-3 border-t border-slate-800/80 pt-4 w-full">
            <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Método de Pago
            </Heading>
            <Grid className="grid grid-cols-2 gap-3 w-full">
              <Button
                label="Pagar en efectivo"
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-xs font-semibold transition cursor-pointer ${
                  formData.paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-500/15 text-orange-200 shadow-sm'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Banknote className="h-6 w-6 mb-1.5 text-orange-400" />
                <Text weight="bold" className="text-sm">Efectivo</Text>
                <Text className="text-[10px] text-slate-500 font-normal">Pagas al recibir</Text>
              </Button>

              <Button
                label="Pagar por transferencia bancaria"
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'transfer' })}
                className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-xs font-semibold transition cursor-pointer ${
                  formData.paymentMethod === 'transfer'
                    ? 'border-orange-500 bg-orange-500/15 text-orange-200 shadow-sm'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Send className="h-6 w-6 mb-1.5 text-orange-400" />
                <Text weight="bold" className="text-sm">Transferencia</Text>
                <Text className="text-[10px] text-slate-500 font-normal">Nequi / Bancolombia</Text>
              </Button>
            </Grid>

            {formData.paymentMethod === 'cash' && (
              <VStack className="animate-in fade-in duration-200 w-full">
                <NumberInput
                  label="¿Con cuánto vas a pagar? (Para llevarte el cambio exacto)"
                  value={formData.cashPaymentAmount ? parseFloat(formData.cashPaymentAmount) : undefined}
                  onChange={(val) => setFormData({ ...formData, cashPaymentAmount: val != null ? String(val) : '' })}
                  placeholder={`Ej: ${grandTotal}`}
                  width="100%"
                  controlClassName="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none transition"
                />
              </VStack>
            )}

            {formData.paymentMethod === 'transfer' && (
              <Card className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs text-slate-400 space-y-1 animate-in fade-in duration-200 w-full">
                <Text weight="bold" className="font-semibold text-slate-300 block">Coordinación de Transferencia</Text>
                <Text className="text-xs text-slate-400 block">
                  Al enviar la orden, la sede te contactará por WhatsApp para confirmar y facilitarte los datos o código QR para tu pago.
                </Text>
              </Card>
            )}
          </VStack>

          {/* Payment Breakdown */}
          <Card className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2 text-xs text-slate-400 w-full">
            <HStack className="flex justify-between w-full">
              <Text className="text-xs text-slate-400">Subtotal ({items.length} {items.length === 1 ? 'producto' : 'productos'})</Text>
              <Text weight="bold" className="text-slate-200 font-medium text-xs">{formatCOP(subtotal)}</Text>
            </HStack>
            <HStack className="flex justify-between w-full">
              <Text className="text-xs text-slate-400">Tarifa de Entrega (Repartidor)</Text>
              <Text weight="bold" className="text-orange-400 font-medium text-xs">{formatCOP(deliveryFee)}</Text>
            </HStack>
            <HStack className="flex justify-between border-t border-slate-800 pt-2 text-base font-black text-white w-full">
              <Text weight="bold" className="text-white text-base">Total a Pagar</Text>
              <Text weight="bold" className="text-orange-500 text-lg font-black">{formatCOP(grandTotal)}</Text>
            </HStack>
          </Card>

          {currentVenue.isOpen === false && (
            <Card className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300 flex items-center gap-2 w-full">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 inline mr-2" />
              <Text className="text-rose-300 text-xs">
                El comercio se encuentra cerrado en este momento.
                {currentVenue.openingHours && ` Horario: ${currentVenue.openingHours}.`}
              </Text>
            </Card>
          )}

          {/* Submit CTA */}
          <Button
            label="Enviar Pedido"
            type="submit"
            isDisabled={isLoading || currentVenue.isOpen === false}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-4 font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition text-sm cursor-pointer"
          >
            {isLoading ? (
              <HStack className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <Text weight="bold" className="text-white text-sm">Enviando Pedido...</Text>
              </HStack>
            ) : currentVenue.isOpen === false ? (
              <HStack className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <Text weight="bold" className="text-white text-sm">Comercio Cerrado</Text>
              </HStack>
            ) : (
              <HStack className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <Text weight="bold" className="text-white text-sm">Enviar Pedido • {formatCOP(grandTotal)}</Text>
              </HStack>
            )}
          </Button>
        </VStack>
      </VStack>
    </VStack>
  );
}