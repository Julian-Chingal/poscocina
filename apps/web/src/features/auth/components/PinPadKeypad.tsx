import React from 'react';
import { Delete } from 'lucide-react';

interface PinPadKeypadProps {
  onDigit: (digit: string) => void;
  onClear: () => void;
  onDelete: () => void;
}

export const PinPadKeypad: React.FC<PinPadKeypadProps> = ({
  onDigit,
  onClear,
  onDelete,
}) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-xs mx-auto">
      {digits.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onDigit(d)}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 text-xl font-bold text-white shadow transition cursor-pointer flex items-center justify-center border border-slate-700/60"
        >
          {d}
        </button>
      ))}

      <button
        type="button"
        onClick={onClear}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-800 active:scale-95 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer flex items-center justify-center border border-slate-700/40"
      >
        Limpiar
      </button>

      <button
        type="button"
        onClick={() => onDigit('0')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 text-xl font-bold text-white shadow transition cursor-pointer flex items-center justify-center border border-slate-700/60"
      >
        0
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-rose-400 transition cursor-pointer flex items-center justify-center border border-slate-700/40"
      >
        <Delete className="w-5 h-5" />
      </button>
    </div>
  );
};
