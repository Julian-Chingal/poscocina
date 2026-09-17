import React from 'react';
import { AlertCircle } from 'lucide-react';
import { KdsItem } from '../types/kds.types';

interface KdsItemCardProps {
  item: KdsItem;
  onNextStatus: (item: KdsItem) => void;
}

export const KdsItemCard: React.FC<KdsItemCardProps> = ({ item, onNextStatus }) => {
  const isReady = item.status === 'ready';
  const isCooking = item.status === 'in_preparation';
  const isDelivered = item.status === 'delivered';

  if (isDelivered) return null;

  return (
    <div
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
          onClick={() => onNextStatus(item)}
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
};
