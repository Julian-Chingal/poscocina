import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  ShoppingBag,
  UtensilsCrossed,
  Store,
  HeartPulse,
  Wine,
  CheckCircle2,
  ArrowRight,
  Printer,
  Smartphone,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react';
import {
  VStack,
  HStack,
  Grid,
  Text,
  Heading,
  Badge,
  Card,
  Button,
} from '@astryxdesign/core';
import { BusinessAffiliationForm } from '../../components/landing/BusinessAffiliationForm';

export const metadata: Metadata = {
  title: 'Vende en Pallevar — Plataforma de Delivery para Restaurantes y Comercios',
  description:
    'Únete a Pallevar y haz crecer tu negocio. Catálogo online, pedidos en tiempo real, gestión de domicilios y cero comisiones abusivas.',
  openGraph: {
    title: 'Vende en Pallevar — Impulsa tus ventas a domicilio',
    description:
      'Afíliate a Pallevar y recibe pedidos directos de comida, productos y compras locales con despacho rápido.',
    type: 'website',
  },
};

const WHATSAPP_DIRECT = 'https://wa.me/573508966184?text=Hola%20Pallevar%2C%20quiero%20afiliar%20mi%20negocio%20al%20sistema%20de%20delivery';

export default function ParaNegociosPage() {
  return (
    <VStack className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden w-full">
      {/* Background radial aura */}
      <VStack className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-orange-600/15 via-amber-600/5 to-transparent pointer-events-none" />

      {/* Top back navigation */}
      <VStack className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          <Text className="text-xs font-semibold text-slate-400">Volver al directorio de comercios</Text>
        </Link>
      </VStack>

      {/* Hero Section */}
      <VStack className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6 lg:pt-14 lg:pb-24 w-full">
        <VStack className="text-center max-w-3xl mx-auto space-y-5 items-center w-full">
          <Badge
            label="Plataforma de Delivery para Restaurantes & Comercios"
            className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-400 shadow-sm"
          />

          <Heading level={1} className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Haz crecer las ventas de tu negocio con <Text weight="bold" className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Pallevar</Text>
          </Heading>

          <Text className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto block">
            Vende comida, compras o productos en línea con tu propio canal digital, comanda sincronizada
            directo a cocina o mostrador y control total de domicilios. Sin intermediarios que asfixien tu rentabilidad.
          </Text>

          <HStack className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 w-full">
            <a
              href="#afiliacion"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-orange-600/30 hover:from-orange-500 hover:to-amber-500 transition"
            >
              <Text weight="bold" className="text-xs text-white">Afiliar mi Negocio Ahora</Text>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href={WHATSAPP_DIRECT}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-6 py-3.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/40 transition"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              <Text weight="bold" className="text-xs text-emerald-300">WhatsApp: 350 896 6184</Text>
            </a>
          </HStack>

          <HStack className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <HStack className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <Text className="text-xs text-slate-400">Activación en 24 horas</Text>
            </HStack>
            <HStack className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <Text className="text-xs text-slate-400">Tus propios repartidores o aliados</Text>
            </HStack>
            <HStack className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <Text className="text-xs text-slate-400">Sin comisiones abusivas</Text>
            </HStack>
          </HStack>
        </VStack>
      </VStack>

      {/* Multi-business Categories */}
      <VStack className="border-y border-slate-800 bg-slate-900/50 py-16 w-full">
        <VStack className="mx-auto max-w-6xl px-4 sm:px-6 w-full">
          <VStack className="text-center max-w-2xl mx-auto space-y-2 mb-12 items-center">
            <Heading level={2} className="text-2xl sm:text-3xl font-black text-white">
              Diseñado para todo tipo de comercio local
            </Heading>
            <Text className="text-xs sm:text-sm text-slate-400 block">
              Pallevar no es solo para restaurantes. Cualquier negocio que entregue productos a domicilio tiene su lugar aquí.
            </Text>
          </VStack>

          <Grid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full">
            <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-3 hover:border-orange-500/40 transition">
              <HStack className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600/15 text-orange-400">
                <UtensilsCrossed className="h-5 w-5" />
              </HStack>
              <Heading level={3} className="font-bold text-white text-base">Restaurantes & Cafés</Heading>
              <Text className="text-xs text-slate-400 leading-relaxed block">
                Menús con fotos, variantes, salsas, extras y comanda automática sincronizada en tiempo real.
              </Text>
            </Card>

            <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-3 hover:border-orange-500/40 transition">
              <HStack className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/15 text-amber-400">
                <Store className="h-5 w-5" />
              </HStack>
              <Heading level={3} className="font-bold text-white text-base">Minimarkets & Tiendas</Heading>
              <Text className="text-xs text-slate-400 leading-relaxed block">
                Catálogo de abarrotes, despensa, lácteos y productos del hogar con stock siempre al día.
              </Text>
            </Card>

            <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-3 hover:border-orange-500/40 transition">
              <HStack className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600/15 text-rose-400">
                <HeartPulse className="h-5 w-5" />
              </HStack>
              <Heading level={3} className="font-bold text-white text-base">Farmacias & Droguerías</Heading>
              <Text className="text-xs text-slate-400 leading-relaxed block">
                Medicamentos de venta libre, cuidado personal y envíos prioritarios en minutos para tus clientes.
              </Text>
            </Card>

            <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-3 hover:border-orange-500/40 transition">
              <HStack className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/15 text-purple-400">
                <Wine className="h-5 w-5" />
              </HStack>
              <Heading level={3} className="font-bold text-white text-base">Licores & Conveniencia</Heading>
              <Text className="text-xs text-slate-400 leading-relaxed block">
                Bebidas frías, hielo, snacks y confitería para despachos rápidos de día y noche.
              </Text>
            </Card>
          </Grid>
        </VStack>
      </VStack>

      {/* Pillars / Key Benefits */}
      <VStack className="py-16 lg:py-24 w-full">
        <VStack className="mx-auto max-w-6xl px-4 sm:px-6 w-full">
          <VStack className="text-center max-w-2xl mx-auto space-y-2 mb-14 items-center">
            <Badge
              label="Ventajas Pallevar"
              className="text-xs font-bold uppercase tracking-wider text-orange-400"
            />
            <Heading level={2} className="text-2xl sm:text-4xl font-black text-white">
              Tecnología que potencia tu negocio, sin ataduras
            </Heading>
          </VStack>

          <Grid className="grid gap-8 md:grid-cols-3 w-full">
            <Card className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 space-y-4">
              <HStack className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
                <TrendingUp className="h-6 w-6" />
              </HStack>
              <Heading level={3} className="text-lg font-bold text-white">Comisiones Justas y Claras</Heading>
              <Text className="text-xs sm:text-sm text-slate-400 leading-relaxed block">
                Otras plataformas cobran hasta el 30% por pedido. Con Pallevar conservas tu margen de ganancia
                para que el delivery sea realmente un canal rentable.
              </Text>
            </Card>

            <Card className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 space-y-4">
              <HStack className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
                <Printer className="h-6 w-6" />
              </HStack>
              <Heading level={3} className="text-lg font-bold text-white">Comandas & Cocina Sincronizadas</Heading>
              <Text className="text-xs sm:text-sm text-slate-400 leading-relaxed block">
                Integra tu operación con comandas térmicas o pantallas de cocina (KDS). Cada pedido que entra
                se imprime o notifica al instante, eliminando errores.
              </Text>
            </Card>

            <Card className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 space-y-4">
              <HStack className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
                <ShieldCheck className="h-6 w-6" />
              </HStack>
              <Heading level={3} className="text-lg font-bold text-white">Control Total del Servicio</Heading>
              <Text className="text-xs sm:text-sm text-slate-400 leading-relaxed block">
                Abre o pausa los pedidos a domicilio con un botón si tu negocio está saturado. Administra
                tus horarios, zonas de cobertura y canales de pago libremente.
              </Text>
            </Card>
          </Grid>
        </VStack>
      </VStack>

      {/* How it works in 3 steps */}
      <VStack className="border-t border-slate-800 bg-slate-900/40 py-16 w-full">
        <VStack className="mx-auto max-w-6xl px-4 sm:px-6 w-full">
          <VStack className="text-center max-w-2xl mx-auto space-y-2 mb-12 items-center">
            <Heading level={2} className="text-2xl sm:text-3xl font-black text-white">
              Comenzar es así de simple
            </Heading>
            <Text className="text-xs sm:text-sm text-slate-400 block">
              En menos de 24 horas tu negocio estará disponible para recibir pedidos online.
            </Text>
          </VStack>

          <Grid className="grid gap-6 md:grid-cols-3 w-full">
            <Card className="relative rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
              <Text weight="bold" className="text-3xl font-black text-orange-500 block">01</Text>
              <Heading level={3} className="text-base font-bold text-white">Contáctanos y Carga tu Catálogo</Heading>
              <Text className="text-xs text-slate-400 leading-relaxed block">
                Nos envías tus productos, precios y fotos. Nuestro equipo te ayuda a dejarlos listos y atractivos.
              </Text>
            </Card>

            <Card className="relative rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
              <Text weight="bold" className="text-3xl font-black text-orange-500 block">02</Text>
              <Heading level={3} className="text-base font-bold text-white">Recibe Pedidos en Tiempo Real</Heading>
              <Text className="text-xs text-slate-400 leading-relaxed block">
                Tus clientes hacen el pedido en la web de Pallevar. Te llega la notificación a tu celular o PC al instante.
              </Text>
            </Card>

            <Card className="relative rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
              <Text weight="bold" className="text-3xl font-black text-orange-500 block">03</Text>
              <Heading level={3} className="text-base font-bold text-white">Despacha y Crece</Heading>
              <Text className="text-xs text-slate-400 leading-relaxed block">
                Preparas el producto, asignas a tu repartidor y el cliente recibe su pedido puntual y satisfecho.
              </Text>
            </Card>
          </Grid>
        </VStack>
      </VStack>

      {/* Affiliation Form Section */}
      <VStack id="afiliacion" className="py-16 lg:py-24 w-full">
        <VStack className="mx-auto max-w-4xl px-4 sm:px-6 w-full">
          <BusinessAffiliationForm />
        </VStack>
      </VStack>

      {/* FAQ Section */}
      <VStack className="border-t border-slate-800 bg-slate-900/30 py-16 w-full">
        <VStack className="mx-auto max-w-4xl px-4 sm:px-6 w-full">
          <VStack className="text-center space-y-2 mb-12 items-center">
            <HelpCircle className="h-8 w-8 text-orange-400 mx-auto" />
            <Heading level={2} className="text-2xl font-black text-white">Preguntas Frecuentes</Heading>
          </VStack>

          <VStack className="space-y-4 w-full">
            <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 w-full">
              <Heading level={4} className="font-bold text-white text-sm">¿Qué tipo de negocios pueden unirse a Pallevar?</Heading>
              <Text className="text-xs text-slate-400 leading-relaxed block">
                Restaurantes, cafeterías, pizzerías, tiendas de barrio, minimarkets, droguerías, licoreras y cualquier negocio local que comercialice productos físicos y realice envíos a domicilio.
              </Text>
            </Card>

            <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 w-full">
              <Heading level={4} className="font-bold text-white text-sm">¿Necesito comprar equipos especiales?</Heading>
              <Text className="text-xs text-slate-400 leading-relaxed block">
                No. Puedes gestionar todo desde cualquier teléfono móvil, tablet o computador con acceso a internet. Si cuentas con impresora térmica de comandas, también puedes conectarla fácilmente.
              </Text>
            </Card>

            <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 w-full">
              <Heading level={4} className="font-bold text-white text-sm">¿Quién entrega los pedidos?</Heading>
              <Text className="text-xs text-slate-400 leading-relaxed block">
                Puedes despachar con tus propios domiciliarios habituales o apoyarte con servicios de mensajería locales independientes. Tienes total libertad para definir el costo y tiempo del envío.
              </Text>
            </Card>

            <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 w-full">
              <Heading level={4} className="font-bold text-white text-sm">¿Cómo me comunico directamente con un asesor?</Heading>
              <Text className="text-xs text-slate-400 leading-relaxed block">
                Puedes escribir o llamar directamente a nuestra línea de captación comercial de WhatsApp al <Text weight="bold" className="text-orange-400 font-bold">+57 350 896 6184</Text>.
              </Text>
            </Card>
          </VStack>
        </VStack>
      </VStack>

      {/* Final Callout Footer */}
      <HStack className="border-t border-slate-800 bg-slate-950 py-12 w-full">
        <HStack className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
          <HStack className="flex items-center gap-3">
            <HStack className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 font-black text-white text-lg">
              <ShoppingBag className="h-5 w-5" />
            </HStack>
            <VStack>
              <Heading level={3} className="font-black text-white text-lg">Pallevar</Heading>
              <Text className="text-xs text-slate-400 block">Red de entregas y domicilios locales</Text>
            </VStack>
          </HStack>

          <HStack className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition">
              <Text className="text-xs text-slate-400">Directorio de Negocios</Text>
            </Link>
            <Text className="text-slate-600">•</Text>
            <a
              href={WHATSAPP_DIRECT}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <Text weight="bold" className="text-xs text-orange-400">WhatsApp: 350 896 6184</Text>
            </a>
          </HStack>
        </HStack>
      </HStack>
    </VStack>
  );
}