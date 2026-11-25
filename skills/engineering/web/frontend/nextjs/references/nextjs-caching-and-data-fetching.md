# Next.js 15 Data Fetching and Caching Architecture

Technical standards for data fetching, predictable caching defaults, tag revalidation, and ORM caching in Next.js 15.

---

## 1. Next.js 15 Uncached-by-Default Standard

In Next.js 15, default caching behavior is uncached (dynamic) unless explicitly configured:
- `fetch()` requests default to `cache: 'no-store'` (no automatic Data Cache persistence).
- `GET` Route Handlers are no longer statically cached by default (opt in with `export const dynamic = 'force-static'`).
- Client-side Router Cache `staleTimes.dynamic` defaults to `0` for Page segments (layouts and loading states still cache).

---

## 2. Opting into Caching Explicitly

When caching is desired, opt in using explicit `cache` and `next.revalidate` directives:

### Time-Based Revalidation
```typescript
export async function getLiveExchangeRates() {
  const res = await fetch('https://api.enterprise.com/v1/rates', {
    next: { revalidate: 60 }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch exchange rates (${res.status})`);
  }
  return res.json();
}
```

### Static Build-Time Caching
```typescript
export async function getStaticCatalog() {
  const res = await fetch('https://api.enterprise.com/v1/catalog', {
    cache: 'force-cache'
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch catalog (${res.status})`);
  }
  return res.json();
}
```

### Static `GET` Route Handler Opt-In
```typescript
export const dynamic = 'force-static';

export async function GET() {
  return Response.json({ status: 'ok' });
}
```

---

## 3. Tag-Based On-Demand Invalidation

Attach cache tags alongside explicit caching (`force-cache` or `revalidate`) so targeted updates can purge cached entries:

```typescript
export async function getProductInventory(productId: string) {
  const encodedId = encodeURIComponent(productId);
  const res = await fetch(`https://api.enterprise.com/v1/inventory/${encodedId}`, {
    cache: 'force-cache',
    next: { tags: ['inventory', `inventory:${encodedId}`] }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch inventory (${res.status})`);
  }
  return res.json();
}
```

Purging the cache tag inside an authenticated Server Action:
```typescript
'use server';

import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { verifyAdminSession, database } from '@/lib/server-auth';

export async function restockItemAction(productId: string) {
  const cookieStore = await cookies();
  const session = await verifyAdminSession(cookieStore.get('session_token')?.value);
  if (!session) {
    throw new Error('Unauthorized');
  }

  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(productId)) {
    throw new Error('Invalid product identifier');
  }

  await database.updateInventory(productId);
  revalidateTag(`inventory:${encodeURIComponent(productId)}`);
}
```

---

## 4. Caching Database and ORM Queries: `unstable_cache`

Because direct database client calls (Prisma, Drizzle, native SQL) do not go through `fetch`, wrap them in `unstable_cache`:

```typescript
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';

export const getCachedUserProfile = unstable_cache(
  async (userId: string) => {
    return db.users.findUnique({ where: { id: userId } });
  },
  ['user-profile-cache-key'],
  {
    revalidate: 300,
    tags: ['user-profiles']
  }
);
```
