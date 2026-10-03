export interface RelativeTimeInfo {
  timeStr: string;
  dateStr: string;
  relative: string;
  isToday: boolean;
  isTomorrow: boolean;
  isPast: boolean;
}

export const formatReservationTime = (isoString: string): RelativeTimeInfo => {
  const date = new Date(isoString);
  const now = new Date();

  const timeStr = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dateStr = date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const isPast = diffMs < -15 * 60 * 1000; // More than 15 mins past

  let relative = '';
  if (isToday) {
    if (diffMinutes > 0 && diffMinutes <= 60) {
      relative = `En ${diffMinutes} min`;
    } else if (diffMinutes > 60 && diffMinutes <= 240) {
      const hours = Math.floor(diffMinutes / 60);
      relative = `En ${hours}h`;
    } else if (diffMinutes < 0 && diffMinutes >= -60) {
      relative = `Hace ${Math.abs(diffMinutes)} min`;
    } else {
      relative = 'Hoy';
    }
  } else if (isTomorrow) {
    relative = 'Mañana';
  } else {
    relative = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  return {
    timeStr,
    dateStr,
    relative,
    isToday,
    isTomorrow,
    isPast,
  };
};

export const buildWhatsAppUrl = (
  phone: string | undefined,
  customerName: string,
  timeStr: string
): string | null => {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return null;

  // If Colombian mobile number (10 digits starting with 3), prepend 57
  const fullNumber = cleaned.length === 10 && cleaned.startsWith('3') ? `57${cleaned}` : cleaned;
  const message = encodeURIComponent(
    `¡Hola ${customerName}! Te escribimos del restaurante para confirmar los detalles de tu reserva programada para las ${timeStr}. ¿Confirmas tu asistencia?`
  );

  return `https://wa.me/${fullNumber}?text=${message}`;
};

export interface ServiceShift {
  id: 'morning' | 'lunch' | 'afternoon' | 'dinner';
  label: string;
  range: string;
  iconName: 'sunrise' | 'sun' | 'sunset' | 'moon';
  colorClass: string;
}

export const getServiceShift = (isoString: string): ServiceShift => {
  const date = new Date(isoString);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const totalMinutes = hour * 60 + minute;

  if (totalMinutes < 12 * 60) {
    return {
      id: 'morning',
      label: 'Desayuno / Mañana',
      range: '08:00 - 12:00',
      iconName: 'sunrise',
      colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    };
  } else if (totalMinutes < 16 * 60 + 30) {
    return {
      id: 'lunch',
      label: 'Almuerzo / Comida',
      range: '12:00 - 16:30',
      iconName: 'sun',
      colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    };
  } else if (totalMinutes < 19 * 60 + 30) {
    return {
      id: 'afternoon',
      label: 'Tarde / Snacks & Café',
      range: '16:30 - 19:30',
      iconName: 'sunset',
      colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    };
  } else {
    return {
      id: 'dinner',
      label: 'Cena / Noche',
      range: '19:30 - 23:59',
      iconName: 'moon',
      colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    };
  }
};
