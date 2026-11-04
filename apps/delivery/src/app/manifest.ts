import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'poscocina Domicilios — Pedidos en Línea',
    short_name: 'Domicilios',
    description: 'Pide tus platos favoritos a domicilio o para llevar en minutos',
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
