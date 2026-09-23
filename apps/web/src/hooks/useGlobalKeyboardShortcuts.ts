import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';

export const useGlobalKeyboardShortcuts = (onNavigate: (view: string) => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Protect modal interactions (e.g. PIN Pad, confirmation dialogs, prompt dialogs)
      const hasActiveModal = Boolean(
        document.querySelector('[role="dialog"], [role="alertdialog"]')
      );
      if (hasActiveModal) {
        return;
      }

      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      if (e.key === 'F1') {
        e.preventDefault();
        onNavigate('salon');
      } else if (e.key === 'F2') {
        e.preventDefault();
        onNavigate('pos');
      } else if (e.key === 'F3') {
        e.preventDefault();
        onNavigate('kds');
      } else if (e.key === 'F4') {
        e.preventDefault();
        onNavigate('shifts');
      } else if (e.key === 'Escape') {
        if (!isInput) {
          e.preventDefault();
          onNavigate('home');
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        useAuthStore.getState().lockScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);
};
