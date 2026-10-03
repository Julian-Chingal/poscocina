import { UrgencyStyles } from '../types/kds.types';

export const getUrgencyStyles = (openedAt: string, currentTime: number): UrgencyStyles => {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((currentTime - new Date(openedAt).getTime()) / 60000)
  );

  if (elapsedMinutes >= 20) {
    return {
      badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 font-bold',
      cardBorder: 'border-t-4 border-t-rose-500 border-x border-b border-border/80 shadow-xs',
      elapsedMinutes,
      label: 'Retrasado (> 20 min)',
    };
  }
  if (elapsedMinutes >= 10) {
    return {
      badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 font-bold',
      cardBorder: 'border-t-4 border-t-amber-500 border-x border-b border-border/80 shadow-xs',
      elapsedMinutes,
      label: 'Demora media (10-20 min)',
    };
  }
  return {
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 font-semibold',
    cardBorder: 'border-t-4 border-t-emerald-500 border-x border-b border-border/80 shadow-xs',
    elapsedMinutes,
    label: 'A tiempo (< 10 min)',
  };
};

