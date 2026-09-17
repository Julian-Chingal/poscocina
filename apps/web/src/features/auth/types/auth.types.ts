export interface PinPadModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isMandatoryLock?: boolean;
}

export type AuthMode = 'pin' | 'password';
