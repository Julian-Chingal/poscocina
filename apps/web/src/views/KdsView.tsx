import React, { useEffect, useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wine,
  Cake,
  Flame,
  Layers,
  UtensilsCrossed,
} from 'lucide-react';
import { io } from 'socket.io-client';

interface KdsItem {
  id: string;
  quantity: number;
  notes?: string | null;
  status: 'pending' | 'sent' | 'in_preparation' | 'ready' | 'delivered';
  course: number;
  product?: {
    name: string;
    station?: 'kitchen' | 'bar' | 'dessert';
  };
  modifiers?: Array<{
    modifierId: string;
  }>;
}

interface KdsOrder {
  id: string;
  orderNumber?: number | string;
  openedAt: string;
  table?: {
    label: string;
  } | null;
  waiter?: {
    name: string;
  } | null;
  items: KdsItem[];
}

type StationFilter = 'all' | 'kitchen' | 'bar' | 'dessert';

const STATIONS: Array<{ id: StationFilter; label: string; icon: any }> = [
  { id: 'all', label: 'Todas las Estaciones', icon: Layers },
  { id: 'kitchen', label: 'Cocina Caliente', icon: Flame },
  { id: 'bar', label: 'Barra & Bebidas', icon: Wine },
  { id: 'dessert', label: 'Postres & Fríos', icon: Cake },
];

export const KdsView: React.FC<{ venueId: string }> = ({ venueId }) => {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStation, setActiveStation] = useState<StationFilter>('all');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Auto-refresh timer every 30s to advance elapsed minutes
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrders = async () => {
    try {
      const url =
        activeStation === 'all'
          ? `/api/venues/${venueId}/kds/orders`
          : `/api/venues/${venueId}/kds/orders?station=${activeStation}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching KDS orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (venueId) {
      fetchOrders();
    }

    const socket = io();
    socket.emit('join:kds', activeStation);

    const refreshHandler = () => fetchOrders();

    socket.on('order:created', refreshHandler);
    socket.on('order:items_appended', refreshHandler);
    socket.on('kds:new_items', refreshHandler);
    socket.on('order_item:updated', refreshHandler);
    socket.on('order:status_updated', refreshHandler);

    return () => {
      socket.off('order:created', refreshHandler);
      socket.off('order:items_appended', refreshHandler);
      socket.off('kds:new_items', refreshHandler);
      socket.off('order_item:updated', refreshHandler);
      socket.off('order:status_updated', refreshHandler);
      socket.disconnect();
    };
  }, [venueId, activeStation]);

  const handleNextStatus = async (item: KdsItem) => {
    let nextStatus: KdsItem['status'] = 'in_preparation';
    if (item.status === 'sent' || item.status === 'pending') {
      nextStatus = 'in_preparation';
    } else if (item.status === 'in_preparation') {
      nextStatus = 'ready';
    } else if (item.status === 'ready') {
      nextStatus = 'delivered';
    }

    try {
      await fetch(`/api/order-items/${item.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchOrders();
    } catch (err) {
      console.error('Error updating item status:', err);
    }
  };

  const getUrgencyStyles = (openedAt: string) => {
    const elapsedMinutes = Math.max(
      0,
      Math.floor((currentTime - new Date(openedAt).getTime()) / 60000)
    );

    if (elapsedMinutes >= 20) {
      return {
        badge: 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse font-extrabold',
        cardBorder: 'border-rose-600/80 shadow-rose-950/50',
        elapsedMinutes,
        label: 'Retrasado',
      };
    }
    if (elapsedMinutes >= 10) {
      return {
        badge: 'bg-amber-950/70 text-amber-300 border-amber-600 font-bold',
        cardBorder: 'border-amber-600/60 shadow-amber-950/30',
        elapsedMinutes,
        label: 'Demora media',
      };
    }
    return {
      badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-700',
      cardBorder: 'border-slate-700/80',
      elapsedMinutes,
      label: 'A tiempo',
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400 animate-spin text-3xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-rose-600 p-2.5 rounded-2xl text-white shadow-lg shadow-rose-600/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">KDS — Pantalla de Producción</h2>
            <p className="text-slate-400 text-xs">
              Pase de comandas y control de tiempos por estación en tiempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300">
          <UtensilsCrossed className="w-4 h-4 text-orange-400" />
          <span>Comandas activas:</span>
          <span className="text-orange-400 font-mono font-bold ml-1">{orders.length}</span>
        </div>
      </div>

      {/* Station Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {STATIONS.map((station) => {
          const Icon = station.icon;
          const isActive = activeStation === station.id;
          return (
            <button
              key={station.id}
              onClick={() => setActiveStation(station.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{station.label}</span>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-16 text-center text-slate-400">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500/80" />
          <p className="text-lg font-bold text-slate-200">¡Estación al día!</p>
          <p className="text-xs text-slate-500 mt-1">
            No hay comandas pendientes en {STATIONS.find((s) => s.id === activeStation)?.label.toLowerCase()}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {orders.map((order) => {
            const urgency = getUrgencyStyles(order.openedAt);

            return (
              <div
                key={order.id}
                className={`bg-slate-800/90 border rounded-2xl overflow-hidden flex flex-col shadow-xl transition-all ${urgency.cardBorder}`}
              >
                {/* Order Header */}
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-700/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-black text-white">
                        {order.table?.label || 'Para Llevar'}
                      </span>
                      {order.orderNumber && (
                        <span className="text-xs font-mono text-slate-400">
                          #{order.orderNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Mesero: <span className="text-slate-300 font-medium">{order.waiter?.name || 'Caja'}</span>
                    </div>
                  </div>

                  {/* Urgency Badge */}
                  <div
                    className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg border font-mono ${urgency.badge}`}
                    title={urgency.label}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{urgency.elapsedMinutes}m</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-3.5 space-y-2.5 flex-1 overflow-y-auto max-h-96">
                  {order.items.map((item) => {
                    const isReady = item.status === 'ready';
                    const isCooking = item.status === 'in_preparation';
                    const isDelivered = item.status === 'delivered';

                    if (isDelivered) return null;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isReady
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                            : isCooking
                            ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                            : 'bg-slate-900/80 border-slate-700/70 text-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold flex items-center space-x-2 min-w-0">
                            <span className="text-orange-400 text-xs font-black bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800 flex-shrink-0">
                              {item.quantity}x
                            </span>
                            <span className="text-white text-xs leading-snug truncate">
                              {item.product?.name || 'Producto'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleNextStatus(item)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex-shrink-0 ${
                              isReady
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                                : isCooking
                                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                            }`}
                          >
                            {isReady ? 'Servido ✓' : isCooking ? '¡Listo!' : 'Cocinar'}
                          </button>
                        </div>

                        {item.notes && (
                          <div className="mt-2 text-[11px] text-rose-300 bg-rose-950/40 p-1.5 rounded-lg border border-rose-800/40 flex items-start space-x-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>Nota: {item.notes}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
