import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pallevar — Domicilios y Envíos',
    short_name: 'Pallevar',
    description: 'Pide comida, compras y productos a domicilio o para llevar en minutos con Pallevar',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#ea580c',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
