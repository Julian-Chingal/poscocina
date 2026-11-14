export interface WhatsAppChat {
  id: string;
  venueId: string;
  phone: string;
  customerId?: string | null;
  customerName?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessage {
  id: string;
  chatId: string;
  venueId: string;
  wahaMessageId?: string | null;
  direction: 'inbound' | 'outbound';
  body: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  status: 'received' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
}

export interface WhatsAppSessionInfo {
  status: 'WORKING' | 'SCAN_QR_CODE' | 'STARTING' | 'STOPPED' | 'DISCONNECTED' | 'UNREACHABLE' | string;
  qr?: string | null;
}
