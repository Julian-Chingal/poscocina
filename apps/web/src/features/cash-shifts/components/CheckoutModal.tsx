import React from 'react';
import { PendingBill } from '../types/cash-shifts.types';
import { SplitBillDialog } from '@/features/pos/components/SplitBillDialog';

interface Props {
  bill: PendingBill | null;
  venueId: string;
  isProcessing?: boolean;
  onClose: () => void;
  onSuccess?: (receipt: any) => void;
}

export const CheckoutModal: React.FC<Props> = ({
  bill,
  venueId,
  onClose,
  onSuccess,
}) => {
  if (!bill) return null;

  return (
    <SplitBillDialog
      isOpen={Boolean(bill)}
      order={bill}
      venueId={venueId}
      customer={null}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

export default CheckoutModal;
