export interface DriverProfile {
  id: string;
  userId: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  city: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'car';
  licensePlate?: string | null;
  status: 'offline' | 'available' | 'busy' | 'suspended';
  trustTier: number; // 1, 2, 3
  creditLimit: string;
  walletBalance: string;
  totalEarnings: string;
  completedDeliveries: number;
  rating?: string | null;
  currentLat?: string | null;
  currentLng?: string | null;
  payoutMethod?: string | null;
  payoutAccount?: string | null;
  isVerified: boolean;
}

export interface DriverWalletTransaction {
  id: string;
  driverProfileId: string;
  orderId?: string | null;
  type: 'delivery_earning' | 'platform_fee_deduction' | 'payout_withdrawal' | 'adjustment';
  amount: string;
  balanceAfter: string;
  notes?: string | null;
  createdAt: string;
}

export interface DriverWalletResponse {
  profile: DriverProfile;
  transactions: DriverWalletTransaction[];
}

export interface DriverOrder {
  id: string;
  venueId: string;
  orderType: string;
  status: string;
  kitchenStatus: string;
  paymentStatus: string;
  dispatchStatus?: string;
  guestName?: string | null;
  notes?: string | null;
  total: string;
  subtotal: string;
  deliveryFee?: string | null;
  driverPayout?: string | null;
  pickupPin?: string | null;
  deliveryPin?: string | null;
  openedAt: string;
  claimedAt?: string | null;
  pickedUpAt?: string | null;
  venue?: {
    id: string;
    name: string;
    address?: string | null;
    phone?: string | null;
  };
  customer?: {
    id: string;
    name: string;
    phone: string;
    address?: string;
  };
  items?: Array<{
    id: string;
    quantity: number;
    product?: {
      name: string;
    };
  }>;
}
