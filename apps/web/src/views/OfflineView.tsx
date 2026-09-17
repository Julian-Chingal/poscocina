import React, { useState } from 'react';
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from '../components/ui/sonner';

interface OfflineViewProps {
  onRetry: () => Promise<void> | void;
}

export const OfflineView: React.FC<OfflineViewProps> = ({ onRetry }) => {
  const [retrying, setRetrying] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string>('Sin respuesta / Network Error');

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const res = await fetch('/health');
      if (res.ok) {
        toast.success('Conexión con el servidor restablecida');
        await onRetry();
      } else if (res.status === 503) {
        const data = await res.json().catch(() => ({}));
        const diagMsg = `Servicio degradado (503): DB ${data.database === 'up' ? 'OK' : 'CAÍDA'} | Redis ${data.redis === 'up' ? 'OK' : 'CAÍDO'}`;
        setDiagnostics(diagMsg);
        toast.error('El servidor está activo pero la base de datos o Redis no responden');
      } else {
        setDiagnostics(`Error del servidor (${res.status}): ${res.statusText}`);
        toast.error('El servidor respondió con un código no disponible');
      }
    } catch {
      setDiagnostics('Sin respuesta / Network Error');
      toast.error('Aún no se puede conectar con el servidor backend');
    } finally {
      setTimeout(() => setRetrying(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Animated Glow Accent */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-18 h-18 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6 shadow-inner">
          <WifiOff className="w-9 h-9" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          Servidor No Disponible
        </h1>

        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          No se pudo establecer conexión con el backend de <strong className="text-slate-200">poscocina</strong> en el puerto local. Verifique que el servicio esté en ejecución o revise su red local.
        </p>

        <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-3.5 mb-6 text-left text-xs space-y-1.5 font-mono text-slate-400">
          <div className="flex items-center gap-2 text-rose-400 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Diagnóstico de Conectividad</span>
          </div>
          <div className="text-[11px] text-slate-500 pl-5">
            Endpoint: <span className="text-slate-300">http://localhost:3000/health</span>
          </div>
          <div className="text-[11px] text-slate-500 pl-5">
            Estado: <span className="text-rose-400 font-bold">{diagnostics}</span>
          </div>
        </div>

        <button
          onClick={handleRetry}
          disabled={retrying}
          className="w-full py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-bold text-sm shadow-lg shadow-orange-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
          <span>{retrying ? 'Verificando servicio...' : 'Reintentar Conexión'}</span>
        </button>
      </div>
    </div>
  );
};
