import { UrgencyStyles } from '../types/kds.types';

export const getUrgencyStyles = (openedAt: string, currentTime: number): UrgencyStyles => {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((currentTime - new Date(openedAt).getTime()) / 60000)
  );

  if (elapsedMinutes >= 20) {
    return {
      badge: 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse font-extrabold',
      cardBorder: 'border-rose-600/80 shadow-rose-950/50',
      elapsedMinutes,
      label: 'Retrasado',
    };
  }
  if (elapsedMinutes >= 10) {
    return {
      badge: 'bg-amber-950/70 text-amber-300 border-amber-600 font-bold',
      cardBorder: 'border-amber-600/60 shadow-amber-950/30',
      elapsedMinutes,
      label: 'Demora media',
    };
  }
  return {
    badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-700',
    cardBorder: 'border-slate-700/80',
    elapsedMinutes,
    label: 'A tiempo',
  };
};
