import { api } from '@/services/api';
import { WhatsAppChat, WhatsAppMessage, WhatsAppSessionInfo } from '../types/whatsapp.types';

export const whatsAppApi = {
  getVenueChats: (venueId: string): Promise<WhatsAppChat[]> =>
    api.get(`/venues/${venueId}/whatsapp/chats`),

  getChatMessages: (chatId: string): Promise<WhatsAppMessage[]> =>
    api.get(`/whatsapp/chats/${chatId}/messages`),

  sendMessage: (chatId: string, text: string): Promise<WhatsAppMessage> =>
    api.post(`/whatsapp/chats/${chatId}/messages`, { text }),

  getSessionStatus: (venueId: string): Promise<WhatsAppSessionInfo> =>
    api.get(`/venues/${venueId}/whatsapp/session`),

  startSession: (venueId: string): Promise<{ success: boolean }> =>
    api.post(`/venues/${venueId}/whatsapp/session/start`),

  confirmTransferPayment: (orderId: string, data?: { receiptUrl?: string; notes?: string }) =>
    api.post(`/orders/${orderId}/confirm-payment`, data || {}),
};
