import React, { useEffect, useState } from 'react';
import { Users, Clock, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';

interface TableItem {
  id: string;
  label: string;
  capacity: number;
  status: 'free' | 'occupied' | 'check_requested' | 'reserved' | 'blocked';
  currentOrderId?: string | null;
}

interface SalonViewProps {
  venueId: string;
  onSelectTable: (table: TableItem) => void;
}

export const SalonView: React.FC<SalonViewProps> = ({ venueId, onSelectTable }) => {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial tables
    const fetchTables = async () => {
      try {
        const res = await fetch(`/api/venues/${venueId}/tables`);
        if (res.ok) {
          const data = await res.json();
          setTables(data);
        }
      } catch (err) {
        console.error('Error fetching tables:', err);
      } finally {
        setLoading(false);
      }
    };

    if (venueId) {
      fetchTables();
    }

    // Connect to WebSockets for real-time table status updates
    const socket = io();
    socket.on('table:status_changed', (payload: { tableId: string; status: TableItem['status'] }) => {
      setTables((prev) =>
        prev.map((t) => (t.id === payload.tableId ? { ...t, status: payload.status } : t))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [venueId]);

  const getStatusColor = (status: TableItem['status']) => {
    switch (status) {
      case 'free':
        return 'bg-emerald-950/40 border-emerald-500/60 text-emerald-400 hover:border-emerald-400';
      case 'occupied':
        return 'bg-amber-950/40 border-amber-500/60 text-amber-400 hover:border-amber-400';
      case 'check_requested':
        return 'bg-purple-950/40 border-purple-500/60 text-purple-400 hover:border-purple-400 animate-pulse';
      case 'reserved':
        return 'bg-blue-950/40 border-blue-500/60 text-blue-400 hover:border-blue-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  const getStatusLabel = (status: TableItem['status']) => {
    switch (status) {
      case 'free':
        return 'Libre';
      case 'occupied':
        return 'Ocupada';
      case 'check_requested':
        return 'Pidiendo Cuenta';
      case 'reserved':
        return 'Reservada';
      default:
        return status;
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
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Mapa de Salón</h2>
          <p className="text-slate-400 text-sm mt-1">
            Supervisa el estado de las mesas en tiempo real y asigna comandas.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/80 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Libre</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Ocupada</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            <span className="text-slate-300">En Cuenta</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-slate-300">Reservada</span>
          </div>
        </div>
      </div>

      {tables.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center text-slate-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-500" />
          <p>No hay mesas configuradas o la base de datos no está inicializada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => onSelectTable(table)}
              className={`flex flex-col justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 ${getStatusColor(
                table.status
              )}`}
            >
              <div className="flex items-start justify-between w-full">
                <span className="text-xl font-black tracking-tight text-white">{table.label}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900/60 border border-current">
                  {getStatusLabel(table.status)}
                </span>
              </div>

              <div className="mt-8 flex items-center justify-between w-full text-xs text-slate-300">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{table.capacity} comensales</span>
                </div>
                {table.status === 'occupied' && (
                  <div className="flex items-center space-x-1 text-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Activa</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
