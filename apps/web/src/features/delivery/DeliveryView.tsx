import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Bike,
  ExternalLink,
  Copy,
  Check,
  RotateCw,
  Search,
  Phone,
  MapPin,
  Clock,
  ChefHat,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  Share2,
  Store,
  MessageCircle,
  Receipt,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { kdsApi } from "@/features/kds/api/kds.api";
import { KdsOrder, KdsItem } from "@/features/kds/types/kds.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

interface DeliveryViewProps {
  venueId?: string;
}

type DeliveryTab = "all" | "pending" | "in_preparation" | "ready" | "delivered";

interface ParsedDeliveryDetails {
  address?: string;
  phone?: string;
  paymentMethod?: string;
  cashAmount?: string;
  instructions?: string;
  cleanNotes?: string;
}

const parseOrderNotes = (notes?: string | null): ParsedDeliveryDetails => {
  if (!notes) return {};
  const result: ParsedDeliveryDetails = {};
  const parts = notes.split(" | ");

  for (const part of parts) {
    if (part.startsWith("Dirección: ")) {
      result.address = part.replace("Dirección: ", "").trim();
    } else if (part.startsWith("Teléfono: ")) {
      result.phone = part.replace("Teléfono: ", "").trim();
    } else if (part.startsWith("Método de pago: ")) {
      result.paymentMethod = part.replace("Método de pago: ", "").trim();
    } else if (part.startsWith("Paga con: ")) {
      result.cashAmount = part.replace("Paga con: ", "").trim();
    } else if (part.startsWith("Indicaciones: ")) {
      result.instructions = part.replace("Indicaciones: ", "").trim();
    } else {
      result.cleanNotes = result.cleanNotes ? `${result.cleanNotes} | ${part}` : part;
    }
  }

  return result;
};

const formatTimeAgo = (dateStr: string): string => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Hace un momento";
  if (diffMins === 1) return "Hace 1 min";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  return `Hace ${diffHours} h`;
};

export const DeliveryView: React.FC<DeliveryViewProps> = ({ venueId: propVenueId }) => {
  const storeVenueId = useAuthStore((s) => s.venueId);
  const availableVenues = useAuthStore((s) => s.availableVenues);
  const activeVenueId = propVenueId || storeVenueId || "";

  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<DeliveryTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [venueSlug, setVenueSlug] = useState<string>("");

  const activeVenue = useMemo(() => {
    return availableVenues.find((v) => v.id === activeVenueId);
  }, [availableVenues, activeVenueId]);

  // Public Storefront URL for customers
  const storefrontUrl = useMemo(() => {
    const envUrl = import.meta.env.VITE_DELIVERY_URL;
    let base = "http://localhost:3001";
    if (envUrl) {
      base = envUrl.replace(/\/$/, "");
    } else if (typeof window !== "undefined") {
      base = `${window.location.protocol}//${window.location.hostname}:3001`;
    }
    return venueSlug ? `${base}/r/${venueSlug}` : base;
  }, [venueSlug]);

  // Fetch venue slug for clean customer URL
  useEffect(() => {
    if (!activeVenueId) return;
    let isMounted = true;
    fetch(`/api/venues/${activeVenueId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        setVenueSlug(data?.slug || activeVenueId);
      })
      .catch(() => {
        if (isMounted) setVenueSlug(activeVenueId);
      });

    return () => {
      isMounted = false;
    };
  }, [activeVenueId]);

  // Fetch delivery and takeout orders
  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!activeVenueId) return;
    if (!isSilent) setIsRefreshing(true);
    try {
      // getOrders with history=true retrieves recent completed orders as well
      const data = await kdsApi.getOrders(activeVenueId, "history");
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Error al cargar pedidos de delivery:", err);
      if (!isSilent) toast.error("No se pudieron actualizar los pedidos");
    } finally {
      setLoading(false);
      if (!isSilent) setIsRefreshing(false);
    }
  }, [activeVenueId]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Filter orders strictly for Delivery & Takeout
  const deliveryOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Match orders with orderType delivery or takeout, or guestName presence without dine-in table
      const isDelivery =
        (ord as any).orderType === "delivery" ||
        (ord as any).orderType === "takeout" ||
        Boolean(ord.guestName && (!ord.table?.label || ord.table.label.toLowerCase().includes("llevar") || ord.table.label.toLowerCase().includes("delivery")));
      return isDelivery;
    });
  }, [orders]);

  // Compute status for an order based on items and kitchenStatus
  const getDeliveryStatus = (order: KdsOrder): "pending" | "in_preparation" | "ready" | "delivered" => {
    if (order.kitchenStatus === "delivered" || (order as any).status === "closed") {
      return "delivered";
    }
    const total = order.items.length;
    const readyCount = order.items.filter((i) => i.status === "ready" || i.status === "delivered").length;
    const prepCount = order.items.filter((i) => i.status === "in_preparation").length;

    if (total > 0 && readyCount === total) return "ready";
    if (prepCount > 0 || readyCount > 0) return "in_preparation";
    return "pending";
  };

  // Filtered orders by active tab and search query
  const filteredOrders = useMemo(() => {
    return deliveryOrders.filter((ord) => {
      const status = getDeliveryStatus(ord);

      if (activeTab !== "all" && status !== activeTab) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const numMatch = ord.orderNumber?.toString().includes(q);
      const nameMatch = ord.guestName?.toLowerCase().includes(q);
      const notesMatch = ord.items.some((i) => i.notes?.toLowerCase().includes(q) || i.product?.name.toLowerCase().includes(q));

      return numMatch || nameMatch || notesMatch;
    });
  }, [deliveryOrders, activeTab, searchQuery]);

  // Tab counts
  const counts = useMemo(() => {
    const res = { all: 0, pending: 0, in_preparation: 0, ready: 0, delivered: 0 };
    for (const ord of deliveryOrders) {
      res.all++;
      const st = getDeliveryStatus(ord);
      res[st]++;
    }
    return res;
  }, [deliveryOrders]);

  // Operations: advance order status
  const handleAdvanceOrderStatus = async (order: KdsOrder, currentStatus: "pending" | "in_preparation" | "ready" | "delivered") => {
    try {
      let targetItemStatus: KdsItem["status"];
      if (currentStatus === "pending") {
        targetItemStatus = "in_preparation";
      } else if (currentStatus === "in_preparation") {
        targetItemStatus = "ready";
      } else {
        targetItemStatus = "delivered";
      }

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                kitchenStatus: targetItemStatus === "delivered" ? "delivered" : o.kitchenStatus,
                items: o.items.map((i) => ({ ...i, status: targetItemStatus })),
              }
            : o
        )
      );

      const itemsToUpdate = order.items.filter((i) => i.status !== targetItemStatus);
      await Promise.all(itemsToUpdate.map((i) => kdsApi.updateItemStatus(i.id, targetItemStatus)));

      toast.success(
        targetItemStatus === "in_preparation"
          ? "Pedido enviado a preparación en cocina"
          : targetItemStatus === "ready"
          ? "Pedido marcado como listo para despacho"
          : "Pedido marcado como entregado"
      );

      fetchOrders(true);
    } catch (err) {
      console.error("Error al actualizar estado del pedido:", err);
      toast.error("No se pudo actualizar el estado del pedido");
      fetchOrders();
    }
  };

  const handleCopyStoreLink = async () => {
    try {
      await navigator.clipboard.writeText(storefrontUrl);
      setCopiedLink(true);
      toast.success("Enlace de la tienda copiado para enviar por WhatsApp");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  const handleOpenStorefront = () => {
    window.open(storefrontUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex-1 flex flex-col w-full min-h-0 bg-background text-foreground animate-in fade-in duration-200">
      {/* Operative Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 py-3.5 shrink-0 flex flex-wrap items-center justify-between gap-3 z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Bike className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-foreground">
                Gestión de Domicilios & Delivery
              </h1>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold"
              >
                En Vivo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Store className="size-3 text-primary shrink-0" />
              <span>Sede:</span>
              <strong className="text-foreground">{activeVenue?.name || "Sede Principal"}</strong>
            </p>
          </div>
        </div>

        {/* Storefront direct links and refresh actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders()}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl text-xs gap-1.5 cursor-pointer"
          >
            <RotateCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyStoreLink}
            title="Copiar enlace de pedidos para compartir por WhatsApp"
            className="h-9 px-3 rounded-xl text-xs gap-1.5 cursor-pointer border-primary/30 text-primary hover:bg-primary/10"
          >
            {copiedLink ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            <span className="font-semibold">{copiedLink ? "Copiado" : "Copiar Enlace WhatsApp"}</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleOpenStorefront}
            title="Abrir la tienda online en una nueva pestaña"
            className="h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xs cursor-pointer"
          >
            <ExternalLink className="size-3.5" />
            <span>Abrir Tienda Online</span>
          </Button>
        </div>
      </header>

      {/* Control Filter Bar */}
      <div className="border-b border-border bg-muted/40 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
              activeTab === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            )}
          >
            <span>Todos</span>
            <span className="px-1.5 py-0.2 rounded-md bg-background/30 text-[10px]">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
              activeTab === "pending"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            )}
          >
            <AlertCircle className="size-3" />
            <span>Nuevos</span>
            <span className="px-1.5 py-0.2 rounded-md bg-background/30 text-[10px]">
              {counts.pending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("in_preparation")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
              activeTab === "in_preparation"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            )}
          >
            <ChefHat className="size-3" />
            <span>En Cocina</span>
            <span className="px-1.5 py-0.2 rounded-md bg-background/30 text-[10px]">
              {counts.in_preparation}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ready")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
              activeTab === "ready"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            )}
          >
            <PackageCheck className="size-3" />
            <span>Listos para Despacho</span>
            <span className="px-1.5 py-0.2 rounded-md bg-background/30 text-[10px]">
              {counts.ready}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("delivered")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
              activeTab === "delivered"
                ? "bg-slate-700 text-white shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            )}
          >
            <CheckCircle2 className="size-3" />
            <span>Entregados</span>
            <span className="px-1.5 py-0.2 rounded-md bg-background/30 text-[10px]">
              {counts.delivered}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72 relative">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por cliente, # o plato..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-card border-border"
          />
        </div>
      </div>

      {/* Orders Operational Grid / Feed */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/10">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <RotateCw className="size-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium">Cargando pedidos de delivery...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Gastronomic Empty State */
          <div className="min-h-[420px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-border/80 bg-card/40 max-w-2xl mx-auto my-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 shadow-xl shadow-amber-500/5">
              <Bike className="size-8" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {searchQuery
                ? `No hay pedidos que coincidan con "${searchQuery}"`
                : activeTab === "all"
                ? "Sin pedidos de delivery en este momento"
                : `No hay pedidos en estado "${
                    activeTab === "pending"
                      ? "Nuevos"
                      : activeTab === "in_preparation"
                      ? "En Cocina"
                      : activeTab === "ready"
                      ? "Listos para Despacho"
                      : "Entregados"
                  }"`}
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mt-1.5 leading-relaxed">
              Los pedidos que tus clientes hagan desde la tienda online aparecerán aquí automáticamente en tiempo real.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyStoreLink}
                className="text-xs gap-1.5 cursor-pointer rounded-xl h-9"
              >
                <Share2 className="size-3.5 text-primary" />
                <span>Copiar Enlace para Clientes</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleOpenStorefront}
                className="text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl h-9 cursor-pointer"
              >
                <ExternalLink className="size-3.5" />
                <span>Probar Tienda Online</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
            {filteredOrders.map((order) => {
              const status = getDeliveryStatus(order);
              const details = parseOrderNotes(order.items[0]?.notes || "");
              const guestName = order.guestName || "Cliente Web";
              const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);

              return (
                <Card
                  key={order.id}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border transition-all duration-200 bg-card shadow-xs overflow-hidden",
                    status === "pending" && "border-amber-500/50 shadow-md shadow-amber-500/5",
                    status === "in_preparation" && "border-blue-500/40",
                    status === "ready" && "border-emerald-500/50 shadow-md shadow-emerald-500/5",
                    status === "delivered" && "border-border/60 opacity-80"
                  )}
                >
                  {/* Card Header */}
                  <CardHeader className="p-4 bg-muted/30 border-b border-border/70 space-y-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-foreground bg-background px-2 py-0.5 rounded-md border border-border shadow-2xs">
                            #{order.orderNumber || order.id.slice(0, 6)}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider",
                              status === "pending" && "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
                              status === "in_preparation" && "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
                              status === "ready" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                              status === "delivered" && "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30"
                            )}
                          >
                            {status === "pending"
                              ? "Nuevo Pedido"
                              : status === "in_preparation"
                              ? "En Preparación"
                              : status === "ready"
                              ? "Listo para Entrega"
                              : "Entregado"}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-sm text-foreground mt-2 truncate">
                          {guestName}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>{formatTimeAgo(order.openedAt)}</span>
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Customer Delivery Details */}
                  <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      {/* Address */}
                      {details.address && (
                        <div className="flex items-start gap-2 text-xs text-foreground bg-muted/40 p-2.5 rounded-xl border border-border/60">
                          <MapPin className="size-4 text-orange-500 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold block truncate">Dirección:</span>
                            <span className="text-muted-foreground text-[11px] line-clamp-2">
                              {details.address}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Phone + WhatsApp button */}
                      {details.phone && (
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground px-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone className="size-3 text-muted-foreground/80 shrink-0" />
                            <span className="font-mono text-foreground font-medium truncate">
                              {details.phone}
                            </span>
                          </div>
                          <a
                            href={`https://wa.me/${details.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <MessageCircle className="size-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}

                      {/* Products Summary */}
                      <div className="pt-2 border-t border-border/60">
                        <div className="text-[11px] font-bold uppercase text-muted-foreground mb-1.5 flex items-center justify-between">
                          <span>Productos ({totalItems})</span>
                        </div>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between text-xs py-1 border-b border-border/30 last:border-0"
                            >
                              <div className="flex items-start gap-1.5 min-w-0 flex-1">
                                <span className="font-mono font-bold text-primary shrink-0">
                                  {item.quantity}x
                                </span>
                                <span className="font-medium text-foreground truncate">
                                  {item.product?.name || "Producto"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs mt-3">
                      <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                        <Receipt className="size-3.5" />
                        <span>
                          {details.paymentMethod === "cash"
                            ? "Efectivo"
                            : details.paymentMethod === "transfer"
                            ? "Transferencia"
                            : details.paymentMethod === "card_on_delivery"
                            ? "Datáfono en entrega"
                            : "Por cobrar"}
                        </span>
                      </div>
                      <span className="font-black text-sm text-foreground">
                        {order.paymentStatus === "paid" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            Pagado
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">
                            Pendiente
                          </span>
                        )}
                      </span>
                    </div>
                  </CardContent>

                  {/* Card Actions */}
                  <CardFooter className="p-3 bg-muted/20 border-t border-border/70 flex items-center justify-end gap-2">
                    {status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleAdvanceOrderStatus(order, "pending")}
                        className="w-full text-xs font-bold h-8.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white cursor-pointer gap-1.5 shadow-xs"
                      >
                        <ChefHat className="size-3.5" />
                        <span>Aceptar / Enviar a Cocina</span>
                      </Button>
                    )}

                    {status === "in_preparation" && (
                      <Button
                        size="sm"
                        onClick={() => handleAdvanceOrderStatus(order, "in_preparation")}
                        className="w-full text-xs font-bold h-8.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer gap-1.5 shadow-xs"
                      >
                        <PackageCheck className="size-3.5" />
                        <span>Marcar Listo para Despacho</span>
                      </Button>
                    )}

                    {status === "ready" && (
                      <Button
                        size="sm"
                        onClick={() => handleAdvanceOrderStatus(order, "ready")}
                        className="w-full text-xs font-bold h-8.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Marcar como Entregado</span>
                      </Button>
                    )}

                    {status === "delivered" && (
                      <div className="w-full text-center text-xs text-muted-foreground py-1 flex items-center justify-center gap-1.5 font-medium">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span>Pedido Completado</span>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliveryView;
