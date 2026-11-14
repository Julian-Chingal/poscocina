import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import {
  MessageSquare,
  Send,
  Phone,
  User,
  CheckCheck,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '@/stores/auth.store';
import { whatsAppApi } from './api/whatsapp.api';
import { WhatsAppChat, WhatsAppMessage, WhatsAppSessionInfo } from './types/whatsapp.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { kdsApi } from '@/features/kds/api/kds.api';
import { KdsOrder } from '@/features/kds/types/kds.types';
import { getAppSocket } from '@/lib/socket';

export const WhatsAppChatView: React.FC = () => {
  const venueId = useAuthStore((s) => s.venueId);

  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<WhatsAppChat | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // WAHA session & QR Modal
  const [sessionInfo, setSessionInfo] = useState<WhatsAppSessionInfo | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [startingSession, setStartingSession] = useState(false);

  // Venue active delivery orders for context
  const [venueOrders, setVenueOrders] = useState<KdsOrder[]>([]);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const selectedChatRef = useRef<WhatsAppChat | null>(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load session status
  const checkSession = useCallback(async () => {
    if (!venueId) return;
    try {
      const info = await whatsAppApi.getSessionStatus(venueId);
      setSessionInfo(info);
    } catch (err) {
      console.warn('Could not load WAHA session info');
    }
  }, [venueId]);

  // Polling for QR / session status while modal is open and not working
  useEffect(() => {
    if (!showQrModal || sessionInfo?.status === 'WORKING') return;

    const interval = setInterval(() => {
      checkSession();
    }, 2500);

    return () => clearInterval(interval);
  }, [showQrModal, sessionInfo?.status, checkSession]);

  // Load Chats
  const loadChats = useCallback(async (silent = false) => {
    if (!venueId) return;
    if (!silent) setLoadingChats(true);
    try {
      const data = await whatsAppApi.getVenueChats(venueId);
      setChats(data);
      if (data.length > 0 && !selectedChatRef.current) {
        setSelectedChat(data[0]);
      }
    } catch (err: any) {
      if (!silent) toast.error('Error al cargar chats de WhatsApp');
    } finally {
      if (!silent) setLoadingChats(false);
    }
  }, [venueId]);

  // Load Messages for selected chat
  const loadMessages = useCallback(async (chatId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const data = await whatsAppApi.getChatMessages(chatId);
      setMessages((prev) => {
        if (
          prev.length === data.length &&
          prev[prev.length - 1]?.id === data[data.length - 1]?.id
        ) {
          return prev;
        }
        setTimeout(scrollToBottom, 50);
        return data;
      });
    } catch (err) {
      if (!silent) toast.error('Error al cargar historial de mensajes');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  // Load active orders for order linking
  const loadOrders = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await kdsApi.getOrders(venueId, 'history');
      if (Array.isArray(data)) {
        setVenueOrders(data);
      }
    } catch (err) {
      console.warn('Error fetching orders for WhatsApp view');
    }
  }, [venueId]);

  // Initial loads, WebSocket listeners & background heartbeat polling
  useEffect(() => {
    if (!venueId) return;
    loadChats();
    checkSession();
    loadOrders();

    const socket = getAppSocket();
    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit('join:venue', venueId);
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on('connect', joinRoom);
    socket.on('reconnect', joinRoom);

    // Real-time incoming / sync message event
    const handleReceived = (data: { chatId: string; message: WhatsAppMessage }) => {
      if (selectedChatRef.current && selectedChatRef.current.id === data.chatId) {
        setMessages((prev) => {
          if (
            prev.some(
              (m) =>
                m.id === data.message.id ||
                (data.message.wahaMessageId && m.wahaMessageId === data.message.wahaMessageId)
            )
          ) {
            return prev;
          }
          return [...prev, data.message];
        });
        setTimeout(scrollToBottom, 100);
      }

      setChats((prev) => {
        const chatExists = prev.some((c) => c.id === data.chatId);
        if (!chatExists) {
          loadChats(true);
          return prev;
        }

        const updated = prev.map((c) =>
          c.id === data.chatId
            ? {
                ...c,
                lastMessage: data.message.body,
                lastMessageAt: data.message.createdAt || new Date().toISOString(),
                unreadCount:
                  selectedChatRef.current?.id === data.chatId
                    ? 0
                    : (c.unreadCount || 0) + (data.message.direction === 'inbound' ? 1 : 0),
              }
            : c
        );
        return updated.sort(
          (a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
        );
      });
    };

    const handleSent = (data: { chatId: string; message: WhatsAppMessage }) => {
      if (selectedChatRef.current && selectedChatRef.current.id === data.chatId) {
        setMessages((prev) => {
          if (
            prev.some(
              (m) =>
                m.id === data.message.id ||
                (data.message.wahaMessageId && m.wahaMessageId === data.message.wahaMessageId)
            )
          ) {
            return prev;
          }
          return [...prev, data.message];
        });
        setTimeout(scrollToBottom, 100);
      }

      setChats((prev) =>
        prev.map((c) =>
          c.id === data.chatId
            ? {
                ...c,
                lastMessage: data.message.body,
                lastMessageAt: data.message.createdAt || new Date().toISOString(),
              }
            : c
        )
      );
    };

    socket.on('whatsapp:message:received', handleReceived);
    socket.on('whatsapp:message:sent', handleSent);

    // Heartbeat fallback polling every 4s + window focus to guarantee zero-refresh sync
    const pollInterval = setInterval(() => {
      loadChats(true);
      if (selectedChatRef.current?.id) {
        loadMessages(selectedChatRef.current.id, true);
      }
    }, 4000);

    const onFocus = () => {
      loadChats(true);
      if (selectedChatRef.current?.id) {
        loadMessages(selectedChatRef.current.id, true);
      }
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', onFocus);
      socket.off('connect', joinRoom);
      socket.off('reconnect', joinRoom);
      socket.off('whatsapp:message:received', handleReceived);
      socket.off('whatsapp:message:sent', handleSent);
    };
  }, [venueId, loadChats, checkSession, loadOrders, loadMessages]);

  // When selected chat changes, fetch messages
  useEffect(() => {
    if (selectedChat?.id) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat?.id, loadMessages]);

  // Send reply
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!selectedChat || !text.trim() || sending) return;

    setSending(true);
    try {
      const sent = await whatsAppApi.sendMessage(selectedChat.id, text.trim());
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
      setInputText('');
      setTimeout(scrollToBottom, 100);

      setChats((prev) =>
        prev.map((c) =>
          c.id === selectedChat.id
            ? { ...c, lastMessage: text.trim(), lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err: any) {
      toast.error('No se pudo enviar el mensaje por WhatsApp');
    } finally {
      setSending(false);
    }
  };

  // Find customer's active order
  const activeCustomerOrder = useMemo(() => {
    if (!selectedChat) return null;
    const phone = selectedChat.phone.replace(/\D/g, '');
    return venueOrders.find((ord) => {
      const isMatchPhone = (ord as any).notes?.includes(phone) || (ord as any).customer?.phone === phone;
      const isOpen = (ord as any).status !== 'closed' && (ord as any).kitchenStatus !== 'delivered';
      return isMatchPhone && isOpen;
    });
  }, [selectedChat, venueOrders]);

  // Confirm transfer payment action
  const handleConfirmTransfer = async (orderId: string) => {
    setConfirmingPayment(true);
    try {
      const res = await whatsAppApi.confirmTransferPayment(orderId, {});
      toast.success('¡Transferencia confirmada! Código PIN enviado por WhatsApp al cliente.');
      loadOrders();
      if (res && res.deliveryPin) {
        toast.info(`CÓDIGO DE ENTREGA generado: ${res.deliveryPin}`);
      }
    } catch (err: any) {
      toast.error('Error al confirmar la transferencia: ' + (err.message || 'Intente nuevamente'));
    } finally {
      setConfirmingPayment(false);
    }
  };

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter(
      (c) =>
        c.customerName?.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
    );
  }, [chats, searchQuery]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* 1. Left Sidebar: Chats List */}
      <div className="flex w-80 flex-col border-r bg-muted/20 sm:w-96">
        <div className="flex items-center justify-between border-b p-3.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-500" />
            <h2 className="font-semibold text-foreground">WhatsApp Negocio</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                checkSession();
                setShowQrModal(true);
              }}
              className="h-8 gap-1 text-xs"
            >
              <QrCode className="h-3.5 w-3.5 text-primary" />
              <span>{sessionInfo?.status === 'WORKING' ? 'Conectado' : 'Vincular'}</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => loadChats()} className="h-8 w-8">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>
        </div>

        {/* Chat Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/40">
          {loadingChats ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Cargando conversaciones...</div>
          ) : filteredChats.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No hay conversaciones registradas aún.
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isSelected = selectedChat?.id === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-muted/50 ${
                    isSelected ? 'bg-primary/10 border-l-4 border-primary font-medium' : ''
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {chat.customerName || `Cliente ${chat.phone.slice(-4)}`}
                      </p>
                      {chat.lastMessageAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {chat.lastMessage || 'Conversación iniciada'}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <Badge variant="default" className="h-5 rounded-full px-1.5 text-[10px] bg-emerald-600">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Middle Panel: Live Chat Conversation */}
      <div className="flex flex-1 flex-col border-r bg-background">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
                  {selectedChat.customerName ? selectedChat.customerName.charAt(0).toUpperCase() : 'W'}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{selectedChat.customerName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>+{selectedChat.phone}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
                  WhatsApp Oficial
                </Badge>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5">
              {loadingMessages ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Cargando mensajes...</div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No hay mensajes previos en esta conversación.
                </div>
              ) : (
                messages.map((msg) => {
                  const isOut = msg.direction === 'outbound';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOut ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                          isOut
                            ? 'bg-emerald-600 text-white rounded-br-xs'
                            : 'bg-card border text-card-foreground rounded-bl-xs'
                        }`}
                      >
                        {/* Media rendering (Nequi/Daviplata transfer screenshots) */}
                        {msg.mediaUrl && (
                          <div className="mb-2 overflow-hidden rounded-lg">
                            <img
                              src={msg.mediaUrl}
                              alt="Comprobante"
                              className="max-h-60 w-auto cursor-pointer object-cover transition-transform hover:scale-105"
                              onClick={() => setPreviewImage(msg.mediaUrl!)}
                            />
                            <p className="mt-1 text-[11px] underline opacity-80 cursor-pointer" onClick={() => setPreviewImage(msg.mediaUrl!)}>
                              🔍 Ver comprobante completo
                            </p>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                        <div
                          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                            isOut ? 'text-emerald-100' : 'text-muted-foreground'
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOut && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="flex items-center gap-1.5 border-t px-4 py-2 bg-muted/10 overflow-x-auto text-xs">
              <span className="text-muted-foreground shrink-0">Respuestas rápidas:</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs rounded-full"
                onClick={() => handleSendMessage('¡Hola! Te compartimos nuestra carta digital para hacer tu pedido a domicilio: https://app.zogui.cloud/r')}
              >
                📋 Enviar Carta
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs rounded-full"
                onClick={() => handleSendMessage('Por favor envíanos la foto del comprobante de transferencia (Nequi o Daviplata) para validar tu pago.')}
              >
                💳 Solicitar Comprobante
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs rounded-full"
                onClick={() => handleSendMessage('¡Tu pedido ya salió en camino con nuestro domiciliario! 🛵')}
              >
                🛵 Pedido en Camino
              </Button>
            </div>

            {/* Message Input Area */}
            <div className="border-t p-3 bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  placeholder="Escribe un mensaje de WhatsApp..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1"
                  disabled={sending}
                />
                <Button type="submit" size="icon" disabled={sending || !inputText.trim()} className="bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <h3 className="font-semibold text-lg text-foreground">Bandeja de Entrada de WhatsApp</h3>
            <p className="max-w-md text-sm mt-1">
              Selecciona una conversación del panel izquierdo para ver los mensajes, validar comprobantes de transferencia y responder en vivo.
            </p>
          </div>
        )}
      </div>

      {/* 3. Right Panel: Active Order & Transfer Payment Verification */}
      <div className="hidden lg:flex w-80 flex-col bg-muted/15 p-4 overflow-y-auto">
        <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Gestión de Domicilio & Pago</span>
        </h3>

        {activeCustomerOrder ? (
          <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Pedido Activo</span>
              <Badge variant="outline" className="text-xs font-mono uppercase">
                {(activeCustomerOrder as any).status}
              </Badge>
            </div>

            <div>
              <p className="text-lg font-bold text-foreground">
                ${Number((activeCustomerOrder as any).total || 0).toLocaleString('es-CO')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeCustomerOrder.items?.length || 0} productos
              </p>
            </div>

            {/* Notes with payment details */}
            {(activeCustomerOrder as any).notes && (
              <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Detalles de Entrega:</p>
                <p className="whitespace-pre-line">{(activeCustomerOrder as any).notes}</p>
              </div>
            )}

            {/* Transfer verification action */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Estado de Pago:</span>
                <Badge
                  variant={
                    (activeCustomerOrder as any).paymentStatus === 'paid' ? 'default' : 'secondary'
                  }
                  className={
                    (activeCustomerOrder as any).paymentStatus === 'paid'
                      ? 'bg-emerald-600'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  }
                >
                  {(activeCustomerOrder as any).paymentStatus === 'paid' ? 'PAGADO' : 'PENDIENTE'}
                </Badge>
              </div>

              {/* Delivery PIN Code (if generated) */}
              {(activeCustomerOrder as any).deliveryPin && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-center">
                  <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                    CÓDIGO DE ENTREGA (PIN)
                  </p>
                  <p className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                    {(activeCustomerOrder as any).deliveryPin}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    El cliente se lo dará al domiciliario
                  </p>
                </div>
              )}

              {(activeCustomerOrder as any).paymentStatus !== 'paid' ? (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1.5 shadow-sm"
                  onClick={() => handleConfirmTransfer(activeCustomerOrder.id)}
                  disabled={confirmingPayment}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{confirmingPayment ? 'Confirmando...' : 'Confirmar Transferencia & Generar PIN'}</span>
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium py-1">
                  <CheckCheck className="h-4 w-4" />
                  <span>Transferencia Verificada</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
            <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <span>No hay pedidos de domicilio activos vinculados a este número en este momento.</span>
          </div>
        )}

        {/* Info card */}
        <div className="mt-auto rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 text-primary" />
            Flujo de Transferencias
          </p>
          <p className="text-[11px] leading-relaxed">
            Revisa el comprobante enviado en el chat. Al dar clic en <strong>Confirmar Transferencia</strong>, el sistema marca el pedido como pagado y le envía al cliente su código de entrega de 4 dígitos.
          </p>
        </div>
      </div>

      {/* QR Code Modal for Linking Venue Phone */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular WhatsApp del Restaurante</DialogTitle>
            <DialogDescription>
              Escanea este código QR desde WhatsApp en el teléfono de tu negocio (Dispositivos vinculados).
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-4">
            {sessionInfo?.status === 'WORKING' ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-14 w-14" />
                <p className="font-semibold text-base">¡WhatsApp Vinculado y Activo!</p>
                <p className="text-xs text-muted-foreground text-center">
                  Tu restaurante está listo para recibir y enviar mensajes automáticos.
                </p>
              </div>
            ) : sessionInfo?.qr ? (
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-xl border bg-white p-4 shadow-md flex items-center justify-center">
                  {sessionInfo.qr.startsWith('data:') || sessionInfo.qr.startsWith('http') ? (
                    <img
                      src={sessionInfo.qr}
                      alt="Código QR WhatsApp"
                      className="h-56 w-56 object-contain"
                    />
                  ) : (
                    <QRCodeSVG value={sessionInfo.qr} size={220} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                  Esperando escaneo desde WhatsApp en tu teléfono...
                </p>
              </div>
            ) : (
              <div className="text-center py-6 max-w-sm mx-auto">
                {startingSession || sessionInfo?.status === 'STARTING' ? (
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Iniciando motor de WhatsApp...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Levantando navegador en WAHA. En unos segundos aparecerá el código QR para escanear.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Sesión no iniciada en WAHA
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Para vincular el número de tu restaurante, inicia la sesión en el servidor y escanea el código QR resultante.
                      </p>
                    </div>
                    <Button
                      size="default"
                      className="mt-2 w-full bg-amber-600 hover:bg-amber-700 text-white font-medium gap-2 shadow-sm"
                      disabled={startingSession}
                      onClick={async () => {
                        if (venueId) {
                          setStartingSession(true);
                          try {
                            await whatsAppApi.startSession(venueId);
                            toast.info('Iniciando WAHA. Esperando código QR...');
                            await checkSession();
                          } catch {
                            toast.error('No se pudo iniciar la sesión en WAHA');
                          } finally {
                            setStartingSession(false);
                          }
                        }
                      }}
                    >
                      <QrCode className="h-4 w-4" />
                      <span>Iniciar Sesión y Generar QR</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-size Image Preview Modal */}
      {previewImage && (
        <Dialog open={Boolean(previewImage)} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-2xl p-2 bg-black/90 border-none">
            <img src={previewImage} alt="Comprobante en grande" className="max-h-[85vh] w-auto mx-auto object-contain rounded-md" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default WhatsAppChatView;
