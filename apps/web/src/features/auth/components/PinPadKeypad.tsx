import React from 'react';
import { Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <Button
          key={d}
          type="button"
          variant="ghost"
          onClick={() => onDigit(d)}
          className="h-14 sm:h-16 rounded-2xl bg-card hover:bg-muted active:scale-95 text-xl font-bold text-foreground shadow-xs transition cursor-pointer flex items-center justify-center border border-border"
        >
          {d}
        </Button>
      ))}

      <Button
        type="button"
        variant="ghost"
        onClick={onClear}
        className="h-14 sm:h-16 rounded-2xl bg-muted/40 hover:bg-muted active:scale-95 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer flex items-center justify-center border border-border"
      >
        Limpiar
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={() => onDigit('0')}
        className="h-14 sm:h-16 rounded-2xl bg-card hover:bg-muted active:scale-95 text-xl font-bold text-foreground shadow-xs transition cursor-pointer flex items-center justify-center border border-border"
      >
        0
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={onDelete}
        className="h-14 sm:h-16 rounded-2xl bg-muted/40 hover:bg-muted active:scale-95 text-muted-foreground hover:text-destructive transition cursor-pointer flex items-center justify-center border border-border"
      >
        <Delete className="w-5 h-5" />
      </Button>
    </div>
  );
};

