export interface WahaMessageMedia {
  url?: string;
  mimetype?: string;
  filename?: string;
  data?: string;
}

export interface WahaWebhookPayload {
  event: 'message' | 'message.ack' | 'session.status' | string;
  session: string;
  engine?: string;
  payload: {
    id: string;
    timestamp: number;
    from: string; // e.g. "573001234567@c.us"
    to?: string;
    fromMe?: boolean;
    body?: string;
    hasMedia?: boolean;
    media?: WahaMessageMedia;
    mediaUrl?: string;
    ack?: number;
    _data?: {
      notifyName?: string;
    };
  };
}

export interface WahaSendTextMessage {
  session: string;
  chatId: string;
  text: string;
}

export interface WahaSendImageMessage {
  session: string;
  chatId: string;
  file: {
    mimetype: string;
    filename: string;
    url?: string;
    data?: string;
  };
  caption?: string;
}
