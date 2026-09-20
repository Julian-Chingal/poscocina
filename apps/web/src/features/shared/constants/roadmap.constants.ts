export interface ModuleDetail {
  title: string;
  subtitle: string;
  phase: string;
  features: string[];
}

export const MODULE_DETAILS: Record<string, ModuleDetail> = {
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
