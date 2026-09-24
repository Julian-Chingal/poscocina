import React from 'react';
import { LockScreen } from './LockScreen';
import { PinPadModalProps } from './types/auth.types';

export const PinPadModal: React.FC<PinPadModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return <LockScreen onUnlocked={onClose} />;
};

export default PinPadModal;
