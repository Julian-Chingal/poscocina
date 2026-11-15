import { NextRequest, NextResponse } from 'next/server';
import { CreateDeliveryOrderSchema } from '@poscocina/shared';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();

    // BFF Layer Validation: validate input structure before reaching the kitchen server
    const validation = CreateDeliveryOrderSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: 'Datos del pedido incompletos o inválidos.',
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const backendUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    const internalSecret = process.env.INTERNAL_SERVICE_SECRET || 'poscocina_internal_delivery_bff';

    const response = await fetch(`${backendUrl}/api/internal/orders/delivery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-service-secret': internalSecret,
      },
      body: JSON.stringify(validation.data),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          message: responseData.message || 'Error al registrar pedido en cocina.',
        },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error('[Delivery BFF] Error processing checkout order:', error);
    return NextResponse.json(
      {
        message: 'No fue posible conectar con el servidor de pedidos. Intenta más tarde.',
      },
      { status: 502 }
    );
  }
}
