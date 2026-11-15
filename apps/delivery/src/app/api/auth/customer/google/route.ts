import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';

    const response = await fetch(`${backendUrl}/api/public/auth/customer/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[Delivery BFF] Error logging in customer with Google:', error);
    return NextResponse.json(
      { message: 'Error de comunicación al autenticar con Google.' },
      { status: 502 }
    );
  }
}
