import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detects if the current viewport or device is in mobile/phone mode.
 * - Mobile screen width (<= 768px, Tailwind md breakpoint)
 * - Mobile touch device in landscape (height <= 500px with coarse pointer)
 * - Mobile User Agent (iPhone, Android, etc.)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
  const isLandscapePhone = window.matchMedia('(max-height: 500px) and (pointer: coarse)').matches;
  const isMobileUA = /Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return isSmallScreen || isLandscapePhone || isMobileUA;
}
