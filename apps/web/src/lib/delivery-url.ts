/**
 * Utility to resolve the public customer delivery & storefront URL.
 * Automatically adapts between local development, staging/QA, and production.
 */
export function getDeliveryBaseUrl(): string {
  // 1. Explicit build-time or environment variable override
  const envUrl = import.meta.env.VITE_DELIVERY_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.replace(/\/$/, '');
  }

  // 2. Client-side runtime detection
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;

    // Local development
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local')
    ) {
      return `${protocol}//${hostname}:3001`;
    }

    // Dokploy / QA / Staging / Production subdomain mapping:
    // e.g. app-qa.poscocina.tech -> https://delivery-qa.poscocina.tech
    // e.g. app.poscocina.tech    -> https://delivery.poscocina.tech
    // e.g. app-staging.poscocina.tech -> https://delivery-staging.poscocina.tech
    if (/^app(-[a-z0-9_-]+)?\./i.test(hostname)) {
      const deliveryHostname = hostname.replace(/^app(-[a-z0-9_-]+)?\./i, 'delivery$1.');
      return `${protocol}//${deliveryHostname}`;
    }

    // Specific domain fallback for poscocina.tech ecosystem
    if (hostname.includes('poscocina.tech')) {
      if (hostname.includes('qa')) {
        return 'https://delivery-qa.poscocina.tech';
      }
      return 'https://delivery.poscocina.tech';
    }

    // General fallback for custom deployments where "app" is in hostname
    if (hostname.includes('app')) {
      return `${protocol}//${hostname.replace('app', 'delivery')}`;
    }

    // Generic fallback for custom domains: prepend delivery.
    return `${protocol}//delivery.${hostname}`;
  }

  // Server-side / static fallback
  return 'http://localhost:3001';
}

/**
 * Returns the full storefront URL for a specific venue or root delivery portal.
 * @param venueSlug Optional venue slug (e.g. "sede-principal")
 */
export function getStorefrontUrl(venueSlug?: string): string {
  const base = getDeliveryBaseUrl();
  const cleanSlug = venueSlug?.trim().replace(/^\/+|\/+$/g, '');
  return cleanSlug ? `${base}/r/${cleanSlug}` : `${base}/`;
}
