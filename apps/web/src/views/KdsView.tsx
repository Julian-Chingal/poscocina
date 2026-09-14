import React, { useEffect, useState } from 'react';
import { ChefHat, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';

interface KdsItem {
  id: string;
  quantity: number;
  notes?: string | null;
  status: 'pending' | 'sent' | 'in_preparation' | 'ready' | 'delivered';
  course: number;
  product?: {
    name: string;
  };
  modifiers?: Array<{
    modifierId: string;
  }>;
}

interface KdsOrder {
  id: string;
  openedAt: string;
  table?: {
    label: string;
  } | null;
  waiter?: {
    name: string;
  } | null;
  items: KdsItem[];
}

export const KdsView: React.FC<{ venueId: string }> = ({ venueId }) => {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/venues/${venueId}/kds/orders`);
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
    socket.emit('join:kds', 'all');

    socket.on('order:created', () => {
      fetchOrders();
    });

    socket.on('order_item:updated', () => {
      fetchOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, [venueId]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400 animate-spin text-2xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-rose-600 p-2.5 rounded-xl text-white shadow-lg shadow-rose-600/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">KDS — Pantalla de Cocina</h2>
            <p className="text-slate-400 text-sm">
              Control de preparación y pase de comandas en tiempo real.
            </p>
          </div>
        </div>

        <div className="text-sm font-semibold bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-slate-300">
          Comandas activas: <span className="text-orange-400 font-bold ml-1">{orders.length}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-16 text-center text-slate-400">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500/80" />
          <p className="text-lg font-medium text-slate-300">¡Cocina al día!</p>
          <p className="text-sm text-slate-500 mt-1">No hay comandas pendientes de preparación en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden flex flex-col shadow-xl"
            >
              {/* Order Header */}
              <div className="bg-slate-900 px-5 py-3 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-white">
                    {order.table?.label || 'Para Llevar'}
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Mesero: {order.waiter?.name || 'Caja'}
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/50 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {Math.max(
                      0,
                      Math.floor((Date.now() - new Date(order.openedAt).getTime()) / 60000)
                    )}
                    m
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 space-y-3 flex-1">
                {order.items.map((item) => {
                  const isReady = item.status === 'ready';
                  const isCooking = item.status === 'in_preparation';

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isReady
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                          : isCooking
                          ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                          : 'bg-slate-900/60 border-slate-700/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-bold flex items-center space-x-2">
                          <span className="text-orange-400 text-sm font-black bg-orange-950 px-2 py-0.5 rounded border border-orange-800">
                            {item.quantity}x
                          </span>
                          <span className="text-white text-sm">{item.product?.name || 'Producto'}</span>
                        </div>

                        <button
                          onClick={() => handleNextStatus(item)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            isReady
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : isCooking
                              ? 'bg-amber-600 hover:bg-amber-500 text-white'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                          }`}
                        >
                          {isReady ? 'Servido' : isCooking ? 'Listo' : 'Cocinar'}
                        </button>
                      </div>

                      {item.notes && (
                        <div className="mt-2 text-xs text-rose-300 bg-rose-950/50 p-2 rounded border border-rose-800/40 flex items-start space-x-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Nota: {item.notes}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
