import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/cart/CartDrawer';
import { CheckoutModal } from '../components/checkout/CheckoutModal';

export const metadata: Metadata = {
  title: 'poscocina Domicilios — Menú y Pedidos en Línea',
  description: 'Explora nuestra red de restaurantes, pide tus platos favoritos a domicilio o pasa a recogerlos sin filas.',
  keywords: ['domicilios', 'restaurante', 'pedir comida', 'menu online', 'gastronomia', 'poscocina'],
  authors: [{ name: 'poscocina' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
  openGraph: {
    title: 'poscocina Domicilios — Menú y Pedidos en Línea',
    description: 'Pide tus platos favoritos a domicilio con preparación en tiempo real.',
    type: 'website',
    locale: 'es_CO',
    images: [
      {
        url: '/pwa-512x512.png',
        width: 512,
        height: 512,
        alt: 'poscocina Domicilios',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'poscocina Domicilios',
    description: 'Pide tus platos favoritos a domicilio en minutos.',
    images: ['/pwa-512x512.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'poscocina Domicilios',
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
        </CartProvider>
      </body>
    </html>
  );
}
