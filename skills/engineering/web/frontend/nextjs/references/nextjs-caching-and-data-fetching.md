# Next.js 15 Data Fetching and Caching Architecture

Technical standards for data fetching, predictable caching defaults, tag revalidation, and ORM caching in Next.js 15.

---

## 1. Next.js 15 Uncached-by-Default Standard

In Next.js 15, default caching behavior is aligned with developer expectations:
- `fetch()` requests default to `cache: 'no-store'` (dynamic fetching without automatic stale responses).
- `GET` Route Handlers are no longer statically cached by default.
- Client-side navigation router cache does not retain stale page content unless configured.

---

## 2. Opting into Caching Explicitly

When caching is desired, opt in using explicit `cache` and `next.revalidate` directives:

### Time-Based Revalidation
```typescript
export async function getLiveExchangeRates() {
  const res = await fetch('https://api.enterprise.com/v1/rates', {
    next: { revalidate: 60 }
  });
  return res.json();
}
```

### Static Build-Time Caching
```typescript
export async function getStaticCatalog() {
  const res = await fetch('https://api.enterprise.com/v1/catalog', {
    cache: 'force-cache'
  });
  return res.json();
}
```

---

## 3. Tag-Based On-Demand Invalidation

Attach cache tags to data fetches, allowing targeted invalidation when updates occur:

```typescript
export async function getProductInventory(productId: string) {
  const res = await fetch(`https://api.enterprise.com/v1/inventory/${productId}`, {
    next: { tags: ['inventory', `inventory:${productId}`] }
  });
  return res.json();
}
```

Purging the cache tag inside a Server Action:
```typescript
'use server';

import { revalidateTag } from 'next/cache';

export async function restockItemAction(productId: string) {
  await database.updateInventory(productId);
  revalidateTag(`inventory:${productId}`);
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
