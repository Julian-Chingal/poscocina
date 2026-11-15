import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { message: 'Identificador de restaurante no proporcionado.' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    const response = await fetch(
      `${backendUrl}/api/public/venues/${encodeURIComponent(slug)}/catalog`,
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60, tags: ['catalog', `venue-${slug}`] },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Catálogo no encontrado.' },
        { status: response.status }
      );
    }

    const catalogData = await response.json();
    return NextResponse.json(catalogData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('[Delivery BFF] Error fetching venue catalog:', error);
    return NextResponse.json(
      { message: 'Error al consultar catálogo del comercio.' },
      { status: 502 }
    );
  }
}
