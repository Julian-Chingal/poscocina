import React from 'react';
import { COLOR_PRESETS } from '../constants/settings.constants';

interface Props {
  primaryColor: string;
  onColorChange: (color: string) => void;
}

export const ColorPickerSection: React.FC<Props> = ({ primaryColor, onColorChange }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-300 mb-2">Color Primario Corporativo</label>
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {COLOR_PRESETS.map((preset) => (
        <button
          key={preset.hex}
          type="button"
          onClick={() => onColorChange(preset.hex)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            primaryColor === preset.hex
              ? 'border-white bg-slate-700 text-white shadow'
              : 'border-slate-700/80 bg-slate-900/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.hex }} />
          <span>{preset.name}</span>
        </button>
      ))}
    </div>
    <div className="flex items-center space-x-2">
      <input
        type="color"
        value={primaryColor}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
      />
      <input
        type="text"
        value={primaryColor}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
      />
    </div>
  </div>
);
