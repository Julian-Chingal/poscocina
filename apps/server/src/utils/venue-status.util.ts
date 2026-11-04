import { DaySchedule, VenueOperatingStatus } from '@poscocina/shared';

export interface VenueStatusEvaluation {
  isOpen: boolean;
  operatingStatus: VenueOperatingStatus;
  reason?: string;
}

export function evaluateVenueOpenStatus(
  venue: { timezone?: string | null; settings?: unknown },
  hasActiveShift = false
): VenueStatusEvaluation {
  const settings = (venue.settings || {}) as Record<string, any>;
  const operatingStatus: VenueOperatingStatus = settings.operatingStatus || 'auto';
  const requireShiftForDelivery: boolean = !!settings.requireShiftForDelivery;

  // 1. Manual Overrides
  if (operatingStatus === 'closed') {
    return {
      isOpen: false,
      operatingStatus: 'closed',
      reason: 'El restaurante se encuentra cerrado temporalmente para pedidos a domicilio.',
    };
  }

  if (operatingStatus === 'open') {
    if (requireShiftForDelivery && !hasActiveShift) {
      return {
        isOpen: false,
        operatingStatus: 'open',
        reason: 'Caja cerrada: El restaurante requiere turno de caja activo para procesar domicilios.',
      };
    }
    return {
      isOpen: true,
      operatingStatus: 'open',
    };
  }

  // 2. Automatic by Schedule ('auto')
  if (requireShiftForDelivery && !hasActiveShift) {
    return {
      isOpen: false,
      operatingStatus: 'auto',
      reason: 'Caja cerrada: El restaurante requiere turno de caja activo para procesar domicilios.',
    };
  }

  const schedule: DaySchedule[] = Array.isArray(settings.schedule) ? settings.schedule : [];

  if (schedule.length > 0) {
    const tz = venue.timezone || 'America/Bogota';
    const now = new Date();

    // Map 3-letter English short day to 0-6 (0 = Sunday, 1 = Monday, ...)
    let currentDayIndex: number;
    try {
      const dayShort = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(now);
      const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      currentDayIndex = dayMap[dayShort] ?? now.getDay();
    } catch {
      currentDayIndex = now.getDay();
    }

    // Get current HH:mm in the target timezone
    let currentTimeStr = '12:00';
    try {
      const timeParts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(now);
      const h = timeParts.find((p) => p.type === 'hour')?.value || '00';
      const m = timeParts.find((p) => p.type === 'minute')?.value || '00';
      currentTimeStr = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
    } catch {
      currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    const todaySchedule = schedule.find((s) => s.day === currentDayIndex);

    if (!todaySchedule || !todaySchedule.enabled) {
      return {
        isOpen: false,
        operatingStatus: 'auto',
        reason: 'El restaurante no atiende hoy según su horario establecido.',
      };
    }

    const { openTime, closeTime } = todaySchedule;

    if (openTime && closeTime) {
      if (closeTime >= openTime) {
        // Standard same-day interval e.g. 11:30 - 22:00
        if (currentTimeStr < openTime || currentTimeStr >= closeTime) {
          return {
            isOpen: false,
            operatingStatus: 'auto',
            reason: `Restaurante cerrado en este momento. Horario de hoy: ${openTime} a ${closeTime}.`,
          };
        }
      } else {
        // Cross-midnight interval e.g. 18:00 - 02:00
        if (currentTimeStr < openTime && currentTimeStr >= closeTime) {
          return {
            isOpen: false,
            operatingStatus: 'auto',
            reason: `Restaurante cerrado en este momento. Horario de hoy: ${openTime} a ${closeTime}.`,
          };
        }
      }
    }
  }

  return {
    isOpen: true,
    operatingStatus: 'auto',
  };
}

export function getDefaultWeeklySchedule(): DaySchedule[] {
  return [
    { day: 1, dayName: 'Lunes', enabled: true, openTime: '11:30', closeTime: '22:00' },
    { day: 2, dayName: 'Martes', enabled: true, openTime: '11:30', closeTime: '22:00' },
    { day: 3, dayName: 'Miércoles', enabled: true, openTime: '11:30', closeTime: '22:00' },
    { day: 4, dayName: 'Jueves', enabled: true, openTime: '11:30', closeTime: '22:00' },
    { day: 5, dayName: 'Viernes', enabled: true, openTime: '11:30', closeTime: '23:00' },
    { day: 6, dayName: 'Sábado', enabled: true, openTime: '11:30', closeTime: '23:00' },
    { day: 0, dayName: 'Domingo', enabled: true, openTime: '11:30', closeTime: '21:00' },
  ];
}
