import React from 'react';
import { Flame, Wine, Cake, Layers } from 'lucide-react';
import { StationFilter } from '../types/kds.types';

export interface StationOption {
  id: StationFilter;
  label: string;
  icon: React.ElementType;
}

export const STATIONS: StationOption[] = [
  { id: 'all', label: 'Todas las Estaciones', icon: Layers },
  { id: 'kitchen', label: 'Cocina Caliente', icon: Flame },
  { id: 'bar', label: 'Barra & Bebidas', icon: Wine },
  { id: 'dessert', label: 'Postres & Fríos', icon: Cake },
];
