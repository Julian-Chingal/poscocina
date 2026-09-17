import React from 'react';

export const ViewLoadingFallback: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-slate-400 space-y-3 animate-in fade-in duration-200">
      <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      <span className="text-xs font-medium tracking-wide text-slate-400">Cargando módulo...</span>
    </div>
  );
};
