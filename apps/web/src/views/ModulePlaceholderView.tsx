import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface ModulePlaceholderProps {
  moduleId: string;
  onBack: () => void;
}

const MODULE_DETAILS: Record<
  string,
  { title: string; subtitle: string; phase: string; features: string[] }
> = {
  inventory: {
    title: 'Inventario & Recetas Escandalladas',
    subtitle: 'Descuento automático de insumos en tiempo real por cada plato vendido.',
    phase: 'Fase 2',
    features: [
      'Recetas técnicas por porciones (gramos, mililitros, unidades).',
      'Descuento automático de stock tras el pago de la orden.',
      'Control de mermas y desperdicios en cocina.',
      'Alertas de stock mínimo y compras a proveedores.',
    ],
  },
  shifts: {
    title: 'Caja, Turnos & Facturación Electrónica',
    subtitle: 'Arqueo de turnos, emisión fiscal y split billing avanzado.',
    phase: 'Fase 2',
    features: [
      'Apertura y cierre de turnos con arqueo ciego.',
      'División de cuentas múltiple (por comensal o montos).',
      'Múltiples métodos de pago simultáneos (efectivo, tarjetas, transferencias).',
      'Integración con comprobantes electrónicos fiscales.',
    ],
  },
  reports: {
    title: 'Reportes Analíticos & Inteligencia de Negocio',
    subtitle: 'Métricas de rentabilidad, platos estrella y tiempos de cocina.',
    phase: 'Fase 3',
    features: [
      'Dashboard de ventas por turnos, días y meses.',
      'Análisis de platos más vendidos vs rentabilidad (Menú Engineering).',
      'Tiempos promedio de preparación por cocinero y estación KDS.',
      'Exportación a Excel, PDF y reportes automáticos al correo.',
    ],
  },
};

export const ModulePlaceholderView: React.FC<ModulePlaceholderProps> = ({ moduleId, onBack }) => {
  const details = MODULE_DETAILS[moduleId] || {
    title: 'Módulo en desarrollo',
    subtitle: 'Esta funcionalidad estará disponible en la siguiente fase.',
    phase: 'Próximamente',
    features: [],
  };

  return (
    <div className="max-w-4xl mx-auto p-12 text-center">
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white mb-8 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 cursor-pointer transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Aplicaciones</span>
      </button>

      <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 text-xs font-bold px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Roadmap — {details.phase}</span>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight">{details.title}</h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">{details.subtitle}</p>

        <div className="mt-8 pt-8 border-t border-slate-700/60 max-w-lg mx-auto text-left">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Alcance del Módulo:
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {details.features.map((feat, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ModulePlaceholderView;
