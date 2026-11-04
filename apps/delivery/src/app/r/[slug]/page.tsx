import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { VenuePublicProfile, CatalogCategory, CatalogProduct } from '../../../types/delivery';
import { RestaurantStorefront } from './RestaurantStorefront';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getVenueCatalog(slug: string): Promise<{
  venue: VenuePublicProfile;
  categories: CatalogCategory[];
  products: CatalogProduct[];
} | null> {
  try {
    const backendUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    const res = await fetch(`${backendUrl}/api/public/venues/${encodeURIComponent(slug)}/catalog`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Error fetching venue catalog on SSR', e);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getVenueCatalog(slug);

  if (!data || !data.venue) {
    return {
      title: 'Restaurante No Encontrado — poscocina',
    };
  }

  const { venue } = data;
  const title = `${venue.name} — Menú Digital & Domicilios`;
  const description = `Pide a domicilio en ${venue.name}. ${venue.address || ''}. Gastronomía preparada al instante y enviada a tu puerta.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [venue.logoUrl || '/pwa-512x512.png'],
    },
  };
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getVenueCatalog(slug);

  if (!data || !data.venue) {
    notFound();
  }

  const { venue, categories, products } = data;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: venue.name,
    image: venue.logoUrl || 'http://localhost:3001/pwa-512x512.png',
    address: venue.address || '',
    telephone: venue.phone || '',
    servesCuisine: 'Gastronomía Artesanal / Internacional',
    priceRange: '$$',
    hasMenu: {
      '@type': 'Menu',
      name: `Menú de ${venue.name}`,
      hasMenuItem: products.slice(0, 10).map((p) => ({
        '@type': 'MenuItem',
        name: p.name,
        description: p.description,
        offers: {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: venue.currency || 'COP',
        },
      })),
    },
    potentialAction: {
      '@type': 'OrderAction',
      target: `http://localhost:3001/r/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RestaurantStorefront
        venue={venue}
        categories={categories || []}
        products={products || []}
      />
    </>
  );
}
