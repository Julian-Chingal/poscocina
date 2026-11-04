import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { OrderStatusView } from './OrderStatusView';

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

async function getOrder(orderId: string) {
  try {
    const backendUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    const res = await fetch(`${backendUrl}/api/public/orders/${encodeURIComponent(orderId)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Error fetching order on SSR', e);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Estado del Pedido #${orderId.slice(0, 8)} — poscocina`,
    description: 'Sigue el estado de preparación y despacho de tu comanda en tiempo real.',
  };
}

export default async function OrderStatusPage({ params }: PageProps) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  return <OrderStatusView initialOrder={order} />;
}
