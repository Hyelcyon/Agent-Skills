import { NextRequest, NextResponse } from 'next/server';

interface StandardApiResponse<T> {
  data?: T;
  error?: string;
  requestId: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<StandardApiResponse<unknown>>> {
  const requestId = crypto.randomUUID();

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const payload = {
      items: [],
      total: 0,
      limit
    };

    return NextResponse.json(
      { data: payload, requestId },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Internal Server Error',
        requestId
      },
      { status: 500 }
    );
  }
}
