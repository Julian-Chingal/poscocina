'use client';

import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { HStack, Grid, Text } from '@astryxdesign/core';
import { VenuePublicProfile } from '../../types/delivery';

const InstagramIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const WhatsAppIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const TikTokIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface Props {
  venue: VenuePublicProfile;
  variant?: 'compact' | 'pills' | 'cards';
  className?: string;
}

export function BusinessSocialLinks({ venue, variant = 'pills', className = '' }: Props) {
  // Extract social links from structured object or direct properties or settings
  const settings = (venue.settings || {}) as Record<string, any>;
  const rawInstagram = venue.instagram || venue.socialLinks?.instagram || settings.instagram;
  const rawFacebook = venue.facebook || venue.socialLinks?.facebook || settings.facebook;
  const rawWhatsapp = venue.whatsapp || venue.socialLinks?.whatsapp || settings.whatsapp || venue.phone;
  const rawTiktok = venue.tiktok || venue.socialLinks?.tiktok || settings.tiktok;
  const rawWebsite = venue.website || venue.socialLinks?.website || settings.website;

  const links: Array<{
    id: string;
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClasses: string;
  }> = [];

  // 1. WhatsApp
  if (rawWhatsapp) {
    const cleanDigits = rawWhatsapp.replace(/[^0-9]/g, '');
    if (cleanDigits.length >= 7) {
      const formattedNumber =
        cleanDigits.length === 10 && cleanDigits.startsWith('3') ? `57${cleanDigits}` : cleanDigits;
      links.push({
        id: 'whatsapp',
        label: 'WhatsApp',
        href: `https://wa.me/${formattedNumber}?text=${encodeURIComponent(
          `Hola ${venue.restaurantName || venue.name}, vi su negocio en Pallevar y deseo consultar información.`
        )}`,
        icon: WhatsAppIcon,
        colorClasses:
          'text-emerald-400 bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/50',
      });
    }
  }

  // 2. Instagram
  if (rawInstagram) {
    const handle = rawInstagram.trim().replace(/^@/, '');
    const href = rawInstagram.startsWith('http') ? rawInstagram : `https://instagram.com/${handle}`;
    links.push({
      id: 'instagram',
      label: 'Instagram',
      href,
      icon: InstagramIcon,
      colorClasses:
        'text-pink-400 bg-pink-500/10 border-pink-500/25 hover:bg-pink-500/20 hover:border-pink-500/50',
    });
  }

  // 3. Facebook
  if (rawFacebook) {
    const href = rawFacebook.startsWith('http')
      ? rawFacebook
      : `https://facebook.com/${rawFacebook.trim().replace(/^@/, '')}`;
    links.push({
      id: 'facebook',
      label: 'Facebook',
      href,
      icon: FacebookIcon,
      colorClasses:
        'text-blue-400 bg-blue-500/10 border-blue-500/25 hover:bg-blue-500/20 hover:border-blue-500/50',
    });
  }

  // 4. TikTok
  if (rawTiktok) {
    const handle = rawTiktok.trim().replace(/^@/, '');
    const href = rawTiktok.startsWith('http') ? rawTiktok : `https://tiktok.com/@${handle}`;
    links.push({
      id: 'tiktok',
      label: 'TikTok',
      href,
      icon: TikTokIcon,
      colorClasses:
        'text-cyan-400 bg-cyan-500/10 border-cyan-500/25 hover:bg-cyan-500/20 hover:border-cyan-500/50',
    });
  }

  // 5. Website
  if (rawWebsite) {
    const href = rawWebsite.startsWith('http') ? rawWebsite : `https://${rawWebsite.trim()}`;
    links.push({
      id: 'website',
      label: 'Sitio Web',
      href,
      icon: Globe,
      colorClasses:
        'text-amber-400 bg-amber-500/10 border-amber-500/25 hover:bg-amber-500/20 hover:border-amber-500/50',
    });
  }

  if (links.length === 0) return null;

  if (variant === 'compact') {
    return (
      <HStack className={`flex items-center gap-1.5 ${className}`}>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              title={item.label}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition shadow-sm ${item.colorClasses}`}
            >
              <Icon className="h-4 w-4" />
            </a>
          );
        })}
      </HStack>
    );
  }

  if (variant === 'cards') {
    return (
      <Grid className={`grid grid-cols-2 gap-2 ${className}`}>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition text-xs font-bold ${item.colorClasses}`}
            >
              <HStack className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <Text weight="bold" className="text-xs">{item.label}</Text>
              </HStack>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          );
        })}
      </Grid>
    );
  }

  // Default 'pills'
  return (
    <HStack className={`flex items-center gap-2 flex-wrap ${className}`}>
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition shadow-sm ${item.colorClasses}`}
          >
            <Icon className="h-3.5 w-3.5" />
            <Text weight="bold" className="text-xs">{item.label}</Text>
          </a>
        );
      })}
    </HStack>
  );
}