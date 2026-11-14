'use client';

import React, { useState } from 'react';
import { Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import {
  VStack,
  HStack,
  Grid,
  Text,
  Heading,
  Button,
  Badge,
  Card,
  TextInput,
  TextArea,
  Selector,
  Link,
} from '@astryxdesign/core';

const WHATSAPP_PHONE = '573508966184'; // Format for wa.me

const BUSINESS_TYPE_OPTIONS = [
  'Restaurante / Comida',
  'Minimarket / Tienda',
  'Farmacia / Salud',
  'Licorería / Bebidas',
  'Panadería / Repostería',
  'Mascotas / Pet Shop',
  'Otro Comercio',
];

export function BusinessAffiliationForm() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'Restaurante / Comida',
    city: '',
    contactName: '',
    phone: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Pre-fill WhatsApp message
    const message = `👋 ¡Hola equipo Pallevar! Quiero afiliar mi negocio a la plataforma:
🏢 *Negocio:* ${formData.businessName || 'Por definir'}
🏷️ *Tipo:* ${formData.businessType}
📍 *Ciudad:* ${formData.city || 'No especificada'}
👤 *Contacto:* ${formData.contactName || 'Propietario'}
📱 *Teléfono:* ${formData.phone || 'El registrado'}
📝 *Detalles:* ${formData.notes || 'Deseo recibir información de planes y comisiones'}`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

    setSubmitted(true);

    // Open WhatsApp in new tab
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="relative rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-10 shadow-2xl w-full">
      <VStack className="max-w-md mx-auto w-full">
        <VStack className="text-center space-y-2 mb-8 items-center w-full">
          <Badge
            label="Afiliación Inmediata"
            className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-xs font-bold text-orange-400"
          />
          <Heading level={3} className="text-2xl font-black text-white">Solicita tu Afiliación</Heading>
          <Text className="text-xs sm:text-sm text-slate-400 block">
            Completa los datos de tu negocio y un asesor comercial de Pallevar se comunicará contigo al instante por WhatsApp.
          </Text>
        </VStack>

        {submitted ? (
          <Card className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center space-y-4 w-full">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
            <Heading level={4} className="text-lg font-bold text-white">¡Solicitud iniciada!</Heading>
            <Text className="text-xs text-slate-300 block">
              Se ha abierto WhatsApp para conectar directamente con tu asesor comercial. Si no abrió automáticamente, haz clic abajo:
            </Text>
            <Link
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                `Hola Pallevar, solicito afiliar mi negocio ${formData.businessName}`
              )}`}
              isExternalLink
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition no-underline"
            >
              <MessageCircle className="h-4 w-4" />
              <Text weight="bold" className="text-xs text-white">Abrir WhatsApp Ahora</Text>
            </Link>
          </Card>
        ) : (
          <VStack as="form" onSubmit={handleSubmit} className="space-y-4 w-full">
            <VStack className="w-full">
              <TextInput
                label="Nombre del Negocio o Marca *"
                value={formData.businessName}
                onChange={(val) => setFormData({ ...formData, businessName: val })}
                placeholder="Ej. Arepas & Burger, Supermercado El Ahorro"
                width="100%"
                controlClassName="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </VStack>

            <Grid className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <VStack className="w-full">
                <Selector
                  label="Tipo de Comercio"
                  options={BUSINESS_TYPE_OPTIONS}
                  value={formData.businessType}
                  onChange={(val) => setFormData({ ...formData, businessType: val })}
                  width="100%"
                  controlClassName="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </VStack>

              <VStack className="w-full">
                <TextInput
                  label="Ciudad / Municipio *"
                  value={formData.city}
                  onChange={(val) => setFormData({ ...formData, city: val })}
                  placeholder="Ej. Mocoa, Pasto, Bogotá"
                  width="100%"
                  controlClassName="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </VStack>
            </Grid>

            <Grid className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <VStack className="w-full">
                <TextInput
                  label="Tu Nombre *"
                  value={formData.contactName}
                  onChange={(val) => setFormData({ ...formData, contactName: val })}
                  placeholder="Nombre y apellido"
                  width="100%"
                  controlClassName="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </VStack>

              <VStack className="w-full">
                <TextInput
                  type="tel"
                  label="WhatsApp / Teléfono *"
                  value={formData.phone}
                  onChange={(val) => setFormData({ ...formData, phone: val })}
                  placeholder="Ej. 3508966184"
                  width="100%"
                  controlClassName="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </VStack>
            </Grid>

            <VStack className="w-full">
              <TextArea
                label="Comentarios o preguntas (opcional)"
                rows={2}
                value={formData.notes}
                onChange={(val) => setFormData({ ...formData, notes: val })}
                placeholder="¿Tienes repartidores propios? ¿Cuántos productos manejas?"
                width="100%"
                controlClassName="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </VStack>

            <Button
              type="submit"
              label="Chatear con Asesor Pallevar (WhatsApp)"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 py-3 text-xs font-bold text-white shadow-lg shadow-orange-600/30 hover:from-orange-500 hover:to-amber-500 transition cursor-pointer"
            >
              <MessageCircle className="h-4 w-4 inline mr-1" />
              <Text weight="bold" className="text-xs text-white">Chatear con Asesor Pallevar (WhatsApp)</Text>
              <Send className="h-3.5 w-3.5 ml-1 inline" />
            </Button>

            <Text className="text-[11px] text-center text-slate-500 pt-1 block">
              Atención comercial directa al <Text weight="bold" className="text-slate-400 font-bold">+57 350 896 6184</Text>. Sin compromisos ni costos de apertura sorpresa.
            </Text>
          </VStack>
        )}
      </VStack>
    </Card>
  );
}
