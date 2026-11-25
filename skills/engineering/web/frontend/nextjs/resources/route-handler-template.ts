import { NextRequest, NextResponse } from 'next/server';

interface StandardApiResponse<T> {
  data?: T;
  error?: string;
  requestId: string;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest): Promise<NextResponse<StandardApiResponse<unknown>>> {
  const requestId = crypto.randomUUID();

  try {
    const rawLimit = request.nextUrl.searchParams.get('limit');
    let limit = DEFAULT_LIMIT;
    if (rawLimit !== null) {
      const parsed = Number(rawLimit);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_LIMIT) {
        return NextResponse.json(
          { error: `Invalid limit parameter; expected integer between 1 and ${MAX_LIMIT}`, requestId },
          { status: 400 }
        );
      }
      limit = parsed;
    }

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
    console.error(`[GET route-handler] requestId=${requestId}`, err);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        requestId
      },
      { status: 500 }
    );
  }
}
