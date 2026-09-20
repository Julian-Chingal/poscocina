import React from 'react';
import { COLOR_PRESETS } from '../constants/settings.constants';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  primaryColor: string;
  onColorChange: (color: string) => void;
}

export const ColorPickerSection: React.FC<Props> = ({ primaryColor, onColorChange }) => {
  const handleColorChange = (color: string) => {
    if (color) {
      document.documentElement.style.setProperty('--primary-brand', color);
    }
    onColorChange(color);
  };

  return (
    <div className="space-y-2">
      <Label className="block text-xs font-semibold text-foreground">Color Primario Corporativo</Label>
      <p className="text-xs text-muted-foreground">
        Personaliza el color de marca de la empresa. Este cambio se aplicará a nivel global para todos los usuarios.
      </p>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {COLOR_PRESETS.map((preset) => {
          const isSelected = primaryColor.toLowerCase() === preset.hex.toLowerCase();
          return (
            <Button
              key={preset.hex}
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => handleColorChange(preset.hex)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 h-auto rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary/15 text-foreground shadow-xs ring-1 ring-primary'
                  : 'border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: preset.hex }} />
              <span>{preset.name}</span>
            </Button>
          );
        })}
      </div>
      <div className="flex items-center space-x-2">
        <Input
          type="color"
          value={primaryColor}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-10 h-9 p-1 rounded-lg cursor-pointer bg-card border-border"
        />
        <Input
          type="text"
          value={primaryColor}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-28 h-9 font-mono text-xs bg-card border-border text-foreground"
          placeholder="#f97316"
        />
      </div>
    </div>
  );
};

