# Next.js 15 Route Handlers and Edge Middleware

Technical guide for authoring backend REST/Webhook endpoints via Route Handlers and executing global request filtering via Middleware.

---

## 1. Route Handlers (`route.ts`)

Route Handlers define custom HTTP handlers inside `app/`. In Next.js 15, `GET` Route Handlers are uncached by default (opt in with `export const dynamic = 'force-static'`) and dynamic `params` are Promises (`await params`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken } from '@/lib/server-auth';

interface CreateOrderPayload {
  itemId: string;
  quantity: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
  }

  const session = await verifyBearerToken(authHeader.slice(7));
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  let body: Partial<CreateOrderPayload>;
  try {
    body = (await request.json()) as Partial<CreateOrderPayload>;
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }

  if (
    typeof body.itemId !== 'string' ||
    !/^[a-zA-Z0-9_-]{1,64}$/.test(body.itemId) ||
    typeof body.quantity !== 'number' ||
    !Number.isInteger(body.quantity) ||
    body.quantity < 1 ||
    body.quantity > 100
  ) {
    return NextResponse.json({ error: 'Invalid order parameters' }, { status: 422 });
  }

  const orderId = `ord_${crypto.randomUUID()}`;
  return NextResponse.json({ orderId, status: 'confirmed' }, { status: 201 });
}
```

---

## 2. Runtime Selection: Node.js vs Edge

By default, Route Handlers run in the Node.js runtime. For edge execution:

```typescript
export const runtime = 'edge';
```

When targeting `runtime = 'edge'`, Node.js standard modules (`node:fs`, `node:child_process`) are not available. Use Web standard APIs (`fetch`, `crypto`, `ReadableStream`).

---

## 3. Global Request Middleware: `middleware.ts`

Middleware executes before a route matches, enabling optimistic session redirects, A/B routing, and correlation headers. **Security invariant:** Middleware is an optimistic routing guard only—never rely on Middleware alone for authorization; always verify sessions and tenant ownership inside Server Components, Server Actions, and Route Handlers:

```typescript
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('auth_token')?.value;

  if (!sessionToken && request.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url);
    const { pathname } = request.nextUrl;
    if (pathname.startsWith('/') && !pathname.startsWith('//')) {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set('x-request-id', crypto.randomUUID());
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*']
};
```
