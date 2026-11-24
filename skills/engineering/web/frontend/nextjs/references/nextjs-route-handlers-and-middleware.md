# Next.js 15 Route Handlers and Edge Middleware

Technical guide for authoring backend REST/Webhook endpoints via Route Handlers and executing global request filtering via Middleware.

---

## 1. Route Handlers (`route.ts`)

Route Handlers define custom request handlers for public APIs, webhooks, and third-party integrations inside the `app/` directory:

```typescript
import { NextRequest, NextResponse } from 'next/server';

interface CreateOrderPayload {
  itemId: string;
  quantity: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
  }

  let body: CreateOrderPayload;
  try {
    body = (await request.json()) as CreateOrderPayload;
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }

  if (!body.itemId || body.quantity <= 0) {
    return NextResponse.json({ error: 'Invalid order parameters' }, { status: 422 });
  }

  const orderId = `ord_${Date.now()}`;
  return NextResponse.json({ orderId, status: 'confirmed' }, { status: 201 });
}
```

---

## 2. Runtime Selection: Node.js vs Edge

By default, Route Handlers run in the Node.js runtime. For ultra-low-latency edge execution:

```typescript
export const runtime = 'edge';
```

When targeting `runtime = 'edge'`, Node.js standard modules (`node:fs`, `node:child_process`) are not available. Use Web standard APIs (`fetch`, `crypto`, `ReadableStream`).

---

## 3. Global Request Middleware: `middleware.ts`

Middleware executes before a request is completed, enabling authentication verification, route protection, and header manipulation:

```typescript
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('auth_token')?.value;

  if (!sessionToken && request.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-forwarded-origin', request.nextUrl.origin);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*']
};
```
