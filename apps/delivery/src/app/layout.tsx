import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/cart/CartDrawer';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { SileoToaster } from '../components/ui/SileoToaster';

export const metadata: Metadata = {
  title: 'Pallevar — Domicilios y Envíos en Minutos',
  description: 'Pide comida, víveres y productos en tus restaurantes y comercios favoritos con Pallevar. Entregas rápidas y seguimiento en tiempo real.',
  keywords: ['pallevar', 'domicilios', 'restaurantes', 'tiendas', 'pedir online', 'envios', 'mercado'],
  authors: [{ name: 'Pallevar' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
  openGraph: {
    title: 'Pallevar — Domicilios y Envíos en Minutos',
    description: 'Pide comida, víveres y productos locales a domicilio con Pallevar.',
    type: 'website',
    locale: 'es_CO',
    images: [
      {
        url: '/pwa-512x512.png',
        width: 512,
        height: 512,
        alt: 'Pallevar Domicilios',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pallevar — Domicilios y Envíos',
    description: 'Pide comida, compras y productos en minutos.',
    images: ['/pwa-512x512.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pallevar',
  },
};

export const viewport: Viewport = {
  themeColor: '#ea580c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/pwa-192x192.png" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-orange-500 selection:text-white flex flex-col">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <CartDrawer />
          <CheckoutModal />
          <SileoToaster />
        </CartProvider>
      </body>
    </html>
  );
}
