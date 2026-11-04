'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  Home,
  MessageCircle,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number | string;
  notes?: string;
  product?: {
    name: string;
  };
}

interface OrderData {
  id: string;
  venueId: string;
  orderType: string;
  status: string;
  kitchenStatus: string;
  paymentStatus: string;
  guestName?: string;
  notes?: string;
  subtotal: string;
  taxTotal: string;
  total: string;
  openedAt: string;
  items: OrderItem[];
}

interface Props {
  initialOrder: OrderData;
}

export function OrderStatusView({ initialOrder }: Props) {
  const [order, setOrder] = useState<OrderData>(initialOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll for live updates every 15 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/public/orders/${order.id}`);
        if (res.ok) {
          const updated = await res.json();
          setOrder(updated);
        }
      } catch (e) {
        console.warn('Failed to poll order status', e);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [order.id]);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/public/orders/${order.id}`);
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCOP = (num: number | string) => {
    const val = typeof num === 'string' ? parseFloat(num) : num;
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  // Determine active step (0 to 3)
  // Step 0: Recibido / Queued
  // Step 1: En Cocina / In kitchen
  // Step 2: Listo para Despacho / Ready
  // Step 3: Entregado / Closed
  let currentStep = 0;
  if (order.status === 'closed') {
    currentStep = 3;
  } else if (order.kitchenStatus === 'ready') {
    currentStep = 2;
  } else if (order.kitchenStatus === 'cooking' || order.status === 'sent_to_kitchen' || order.kitchenStatus === 'partially_ready') {
    currentStep = 1;
  }

  const steps = [
    { title: 'Pedido Recibido', desc: 'Comanda registrada en el sistema', icon: CheckCircle2 },
    { title: 'En Preparación', desc: 'Nuestros cocineros están con tu plato', icon: ChefHat },
    { title: 'Listo para Despacho', desc: 'Empacado y listo para salir', icon: Bike },
    { title: 'Entregado', desc: '¡Que disfrutes tu comida!', icon: Home },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a la tienda</span>
      </Link>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5">
          <div>
            <span className="inline-block rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-0.5 text-xs font-bold text-orange-400 mb-1.5">
              Domicilio Activo
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">Seguimiento de tu Pedido</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">ID: #{order.id.slice(0, 8)}</p>
          </div>
          <button
            onClick={refreshStatus}
            disabled={isRefreshing}
            className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-400 hover:text-white hover:border-orange-500/50 transition disabled:opacity-50"
            title="Actualizar estado"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-orange-500' : ''}`} />
          </button>
        </div>

        {/* Timeline Stepper */}
        <div className="py-8">
          <div className="relative flex justify-between">
            {/* Background Line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0" />
            <div
              className="absolute top-4 left-6 h-0.5 bg-orange-500 transition-all duration-500 -z-0"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((s, idx) => {
              const isDone = idx <= currentStep;
              const isCurrent = idx === currentStep;
              const Icon = s.icon;

              return (
                <div key={s.title} className="flex flex-col items-center relative z-10 text-center w-24">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                      isDone
                        ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/30'
                        : 'border-slate-800 bg-slate-950 text-slate-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`mt-2.5 text-xs font-bold ${
                      isCurrent ? 'text-orange-400' : isDone ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details & Items */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detalles de la Comanda</h3>

          <div className="divide-y divide-slate-800/60">
            {order.items?.map((item) => (
              <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-white">
                    {item.quantity}x {item.product?.name || 'Plato'}
                  </span>
                  {item.notes && (
                    <p className="text-[11px] text-orange-300/80 italic">"{item.notes}"</p>
                  )}
                </div>
                <span className="font-medium text-slate-300">
                  {formatCOP(parseFloat(item.unitPrice as string) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800/80 pt-3 space-y-1 text-xs text-slate-400">
            {order.notes && (
              <div className="mb-2 rounded-lg bg-slate-900 p-2.5 text-[11px] text-slate-300">
                <span className="font-bold text-orange-400">Despacho: </span>
                {order.notes}
              </div>
            )}
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-200">{formatCOP(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Impuesto al Consumo</span>
              <span className="text-slate-200">{formatCOP(order.taxTotal)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-black text-white">
              <span>Total a Pagar</span>
              <span className="text-orange-500">{formatCOP(order.total)}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Help CTA */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-200">¿Dudas con tu entrega?</p>
              <p className="text-[11px] text-emerald-300/80">Comunícate con el equipo de la sede por WhatsApp</p>
            </div>
          </div>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition text-center"
          >
            Abrir WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
