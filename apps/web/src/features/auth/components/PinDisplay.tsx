import React from 'react';
import { AlertCircle } from 'lucide-react';

interface PinDisplayProps {
  pin: string;
  error: string | null;
  isLoading: boolean;
}

export const PinDisplay: React.FC<PinDisplayProps> = ({ pin, error, isLoading }) => {
  return (
    <div className="mb-5 text-center">
      {error && (
        <div className="p-3 mb-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dots Indicator */}
      <div className="flex justify-center items-center gap-3 py-2">
        {[0, 1, 2, 3].map((idx) => {
          const isFilled = pin.length > idx;
          return (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-150 ${
                isFilled
                  ? 'bg-amber-400 scale-110 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'bg-slate-700/80 border border-slate-600/60'
              }`}
            />
          );
        })}
      </div>

      {isLoading && (
        <span className="text-xs text-amber-400 font-medium animate-pulse block mt-1">
          Validando credencial...
        </span>
      )}
    </div>
  );
};
