export const formatCurrency = (amount: number | string | null | undefined): string => {
  const numeric = typeof amount === 'number' ? amount : Number(amount);
  const safeAmount = !isNaN(numeric) && isFinite(numeric) ? numeric : 0;

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(safeAmount);
};

