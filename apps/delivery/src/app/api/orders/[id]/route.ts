import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id || id.trim() === '') {
      return NextResponse.json(
        { message: 'ID de pedido requerido.' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/public/orders/${encodeURIComponent(id)}`, {
      headers: {
        'Accept': 'application/json',
      },
      // Short cache window for polling status to protect server
      next: { revalidate: 3 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Pedido no encontrado.' },
        { status: response.status }
      );
    }

    const orderData = await response.json();
    return NextResponse.json(orderData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=5',
      },
    });
  } catch (error: any) {
    console.error('[Delivery BFF] Error fetching order status:', error);
    return NextResponse.json(
      { message: 'Error al consultar el estado del pedido.' },
      { status: 502 }
    );
  }
}
