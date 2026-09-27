import { create } from 'zustand';

export type FontSizePreset = 'compact' | 'normal' | 'large' | 'xlarge';

export interface TypographyState {
  fontSize: number; // in pixels (default: 16)
  preset: FontSizePreset;
  highContrast: boolean;
  setFontSize: (size: number) => void;
  setPreset: (preset: FontSizePreset) => void;
  setHighContrast: (enabled: boolean) => void;
  resetToDefault: () => void;
}

export const STORAGE_KEY = 'poscocina_font_size';
export const HIGH_CONTRAST_KEY = 'poscocina_high_contrast';

export const PRESET_MAP: Record<FontSizePreset, number> = {
  compact: 14,
  normal: 16,
  large: 18,
  xlarge: 20,
};

export const PRESET_INFO: Record<
  FontSizePreset,
  { label: string; description: string; scale: string; px: number }
> = {
  compact: {
    label: 'Compacta',
    description: 'Para tablets de 7-10", móviles o alta densidad de información',
    scale: '87.5%',
    px: 14,
  },
  normal: {
    label: 'Estándar',
    description: 'Tamaño balanceado predeterminado de la plataforma',
    scale: '100%',
    px: 16,
  },
  large: {
    label: 'Grande',
    description: 'Excelente para terminales táctiles POS y cajeros',
    scale: '112.5%',
    px: 18,
  },
  xlarge: {
    label: 'Accesible',
    description: 'Máxima visibilidad para pantallas lejanas (Cocina / KDS)',
    scale: '125%',
    px: 20,
  },
};

function getPresetFromSize(size: number): FontSizePreset {
  if (size <= 14) return 'compact';
  if (size <= 16) return 'normal';
  if (size <= 18) return 'large';
  return 'xlarge';
}

export function applyFontSizeToDOM(size: number) {
  if (typeof document !== 'undefined') {
    document.documentElement.style.fontSize = `${size}px`;
    document.documentElement.style.setProperty('--app-font-size', `${size}px`);
  }
}

export function applyHighContrastToDOM(enabled: boolean) {
  if (typeof document !== 'undefined') {
    if (enabled) {
      document.documentElement.classList.add('font-high-contrast');
    } else {
      document.documentElement.classList.remove('font-high-contrast');
    }
  }
}

export const useTypographyStore = create<TypographyState>((set, get) => {
  let initialSize = 16;
  let initialHighContrast = false;

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 12 && parsed <= 24) {
          initialSize = parsed;
        }
      }
      const savedContrast = localStorage.getItem(HIGH_CONTRAST_KEY);
      if (savedContrast === 'true') {
        initialHighContrast = true;
      }
    } catch {
      // LocalStorage fallback for sandboxed environments
    }

    applyFontSizeToDOM(initialSize);
    applyHighContrastToDOM(initialHighContrast);
  }

  return {
    fontSize: initialSize,
    preset: getPresetFromSize(initialSize),
    highContrast: initialHighContrast,

    setFontSize: (size: number) => {
      const clamped = Math.max(12, Math.min(24, size));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, String(clamped));
        } catch {}
      }
      applyFontSizeToDOM(clamped);
      set({
        fontSize: clamped,
        preset: getPresetFromSize(clamped),
      });
    },

    setPreset: (preset: FontSizePreset) => {
      const size = PRESET_MAP[preset];
      get().setFontSize(size);
    },

    setHighContrast: (enabled: boolean) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(HIGH_CONTRAST_KEY, String(enabled));
        } catch {}
      }
      applyHighContrastToDOM(enabled);
      set({ highContrast: enabled });
    },

    resetToDefault: () => {
      get().setFontSize(16);
      get().setHighContrast(false);
    },
  };
});
