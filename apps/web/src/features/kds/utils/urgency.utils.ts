import { UrgencyStyles } from '../types/kds.types';

export const getUrgencyStyles = (openedAt: string, currentTime: number): UrgencyStyles => {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((currentTime - new Date(openedAt).getTime()) / 60000)
  );

  if (elapsedMinutes >= 20) {
    return {
      badge: 'bg-destructive/15 text-destructive border-destructive/40 animate-pulse font-extrabold',
      cardBorder: 'border-destructive/80 shadow-destructive/20',
      elapsedMinutes,
      label: 'Retrasado',
    };
  }
  if (elapsedMinutes >= 10) {
    return {
      badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 font-bold',
      cardBorder: 'border-amber-500/60 shadow-amber-500/20',
      elapsedMinutes,
      label: 'Demora media',
    };
  }
  return {
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
    cardBorder: 'border-border',
    elapsedMinutes,
    label: 'A tiempo',
  };
};
