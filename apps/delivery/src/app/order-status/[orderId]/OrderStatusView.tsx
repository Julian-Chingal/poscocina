"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import {
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Badge,
  Card,
} from "@astryxdesign/core";

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
  deliveryPin?: string | null;
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

  // Poll for live updates every 15 seconds via Delivery BFF
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`);
        if (res.ok) {
          const updated = await res.json();
          setOrder(updated);
        }
      } catch (e) {
        console.warn("Failed to poll order status", e);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [order.id]);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`);
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCOP = (num: number | string) => {
    const val = typeof num === "string" ? parseFloat(num) : num;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Determine active step (0 to 3)
  let currentStep = 0;
  if (order.status === "closed") {
    currentStep = 3;
  } else if (order.kitchenStatus === "ready") {
    currentStep = 2;
  } else if (
    order.kitchenStatus === "cooking" ||
    order.status === "sent_to_kitchen" ||
    order.kitchenStatus === "partially_ready"
  ) {
    currentStep = 1;
  }

  const steps = [
    {
      title: "Pedido Recibido",
      desc: "Comanda registrada en el sistema",
      icon: CheckCircle2,
    },
    {
      title: "En Preparación",
      desc: "Nuestros cocineros están con tu plato",
      icon: ChefHat,
    },
    {
      title: "Listo para Despacho",
      desc: "Empacado y listo para salir",
      icon: Bike,
    },
    { title: "Entregado", desc: "¡Que disfrutes tu comida!", icon: Home },
  ];

  return (
    <VStack className="mx-auto max-w-2xl px-4 py-8 sm:px-6 w-full">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-6 self-start"
      >
        <ArrowLeft className="h-4 w-4" />
        <Text className="text-xs font-semibold text-slate-400">Volver a la tienda</Text>
      </Link>

      <Card className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-2xl w-full">
        {/* Header */}
        <HStack className="flex items-start justify-between border-b border-slate-800 pb-5 w-full">
          <VStack>
            <Badge
              label="Domicilio Activo"
              className="inline-block rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-0.5 text-xs font-bold text-orange-400 mb-1.5"
            />
            <Heading level={1} className="text-xl sm:text-2xl font-black text-white">
              Seguimiento de tu Pedido
            </Heading>
            <Text className="text-xs text-slate-400 mt-1 font-mono block">
              ID: #{order.id.slice(0, 8)}
            </Text>
          </VStack>
          <Button
            label="Actualizar estado"
            onClick={refreshStatus}
            isDisabled={isRefreshing}
            className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-400 hover:text-white hover:border-orange-500/50 transition disabled:opacity-50 cursor-pointer"
            tooltip="Actualizar estado"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin text-orange-500" : ""}`}
            />
          </Button>
        </HStack>

        {/* Timeline Stepper */}
        <VStack className="py-8 w-full">
          <HStack className="relative flex justify-between w-full">
            {/* Background Line */}
            <VStack className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 z-0" />
            <VStack
              className="absolute top-4 left-6 h-0.5 bg-orange-500 transition-all duration-500 z-0"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((s, idx) => {
              const isDone = idx <= currentStep;
              const isCurrent = idx === currentStep;
              const Icon = s.icon;

              return (
                <VStack
                  key={s.title}
                  className="flex flex-col items-center relative z-10 text-center w-24"
                >
                  <HStack
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                      isDone
                        ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/30"
                        : "border-slate-800 bg-slate-950 text-slate-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </HStack>
                  <Text
                    weight="bold"
                    className={`mt-2.5 text-xs font-bold block ${
                      isCurrent
                        ? "text-orange-400"
                        : isDone
                          ? "text-slate-200"
                          : "text-slate-500"
                    }`}
                  >
                    {s.title}
                  </Text>
                </VStack>
              );
            })}
          </HStack>
        </VStack>

        {/* Delivery PIN Code Banner */}
        {order.deliveryPin && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-center my-3 shadow-lg">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              🔑 Tu Código de Entrega
            </p>
            <p className="text-4xl font-mono font-black text-white tracking-widest my-1">
              {order.deliveryPin}
            </p>
            <p className="text-xs text-slate-300">
              Entrégale este código al domiciliario cuando llegue a tu puerta para recibir tu pedido.
            </p>
          </div>
        )}

        {/* Order Details & Items */}
        <Card className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-5 space-y-4 w-full">
          <Heading level={3} className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Detalles de la Comanda
          </Heading>

          <VStack className="divide-y divide-slate-800/60 w-full">
            {order.items?.map((item) => (
              <HStack
                key={item.id}
                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-sm w-full"
              >
                <VStack>
                  <Text weight="bold" className="font-semibold text-white">
                    {item.quantity}x {item.product?.name || "Plato"}
                  </Text>
                  {item.notes && (
                    <Text className="text-[11px] text-orange-300/80 italic block">
                      "{item.notes}"
                    </Text>
                  )}
                </VStack>
                <Text weight="bold" className="font-medium text-slate-300">
                  {formatCOP(
                    parseFloat(item.unitPrice as string) * item.quantity,
                  )}
                </Text>
              </HStack>
            ))}
          </VStack>

          <VStack className="border-t border-slate-800/80 pt-3 space-y-1 text-xs text-slate-400 w-full">
            {order.notes && (
              <Card className="mb-2 rounded-lg bg-slate-900 p-2.5 text-[11px] text-slate-300 w-full">
                <Text weight="bold" className="font-bold text-orange-400 inline mr-1">Despacho: </Text>
                <Text className="text-slate-300 text-xs inline">{order.notes}</Text>
              </Card>
            )}
            <HStack className="flex justify-between w-full">
              <Text className="text-xs text-slate-400">Subtotal</Text>
              <Text className="text-slate-200 text-xs">
                {formatCOP(order.subtotal)}
              </Text>
            </HStack>
            <HStack className="flex justify-between w-full">
              <Text className="text-xs text-slate-400">Impuesto al Consumo</Text>
              <Text className="text-slate-200 text-xs">
                {formatCOP(order.taxTotal)}
              </Text>
            </HStack>
            <HStack className="flex justify-between border-t border-slate-800 pt-2 text-sm font-black text-white w-full">
              <Text weight="bold" className="text-white text-sm">Total a Pagar</Text>
              <Text weight="bold" className="text-orange-500 text-sm font-black">{formatCOP(order.total)}</Text>
            </HStack>
          </VStack>
        </Card>

        {/* WhatsApp Help CTA */}
        <Card className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 w-full">
          <HStack className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-emerald-400 shrink-0" />
            <VStack>
              <Text weight="bold" className="text-xs font-bold text-emerald-200 block">
                ¿Dudas con tu entrega?
              </Text>
              <Text className="text-[11px] text-emerald-300/80 block">
                Comunícate con el equipo de la sede por WhatsApp
              </Text>
            </VStack>
          </HStack>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition text-center"
          >
            <Text weight="bold" className="text-xs text-white">Abrir WhatsApp</Text>
          </a>
        </Card>
      </Card>
    </VStack>
  );
}