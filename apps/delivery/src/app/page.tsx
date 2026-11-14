import React from "react";
import { VenuePublicProfile } from "../types/delivery";
import { DirectoryView } from "../components/directory/DirectoryView";

async function getPublicVenues(): Promise<VenuePublicProfile[]> {
  try {
    const backendUrl = process.env.INTERNAL_API_URL || "http://localhost:3000";
    const res = await fetch(`${backendUrl}/api/public/venues`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error("Error fetching public venues on SSR", e);
    return [];
  }
}

export default async function MultiVenueDirectoryPage() {
  const venues = await getPublicVenues();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Pallevar Delivery Network",
    image: "http://localhost:3001/pwa-512x512.png",
    description:
      "Red de restaurantes y comercios con delivery y despachos en tiempo real.",
    url: "http://localhost:3001",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DirectoryView initialVenues={venues} />
    </>
  );
}
