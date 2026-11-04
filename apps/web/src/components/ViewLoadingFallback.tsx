import React from 'react';
import { GastronomicLoader } from './common/GastronomicLoader';

export const ViewLoadingFallback: React.FC = () => {
  return (
    <GastronomicLoader
      variant="fullscreen"
      iconType="cloche"
      submessage="PosCocina · Sabor tradicional & Alta cocina"
    />
  );
};
