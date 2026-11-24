# Next.js 15 Async Request APIs

Technical guide for handling asynchronous `cookies()`, `headers()`, `params`, and `searchParams` in Next.js 15.

---

## 1. Asynchronous Transition in Next.js 15

In Next.js 15, dynamic request data APIs are asynchronous and return Promises:
- `cookies()`: Returns `Promise<ReadonlyRequestCookies>`
- `headers()`: Returns `Promise<ReadonlyHeaders>`
- `params`: Passed to layouts and pages as `Promise<T>`
- `searchParams`: Passed to pages as `Promise<T>`

This change aligns with React 19 concurrent evaluation and enables fine-grained server streaming.

---

## 2. Server Component Consumption Standard

Always `await` request APIs before reading their values:

```tsx
import { cookies, headers } from 'next/headers';

interface PageProps {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ view?: string }>;
}

export default async function OrgSettingsPage({ params, searchParams }: PageProps) {
  const { orgId } = await params;
  const { view = 'overview' } = await searchParams;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('auth_session');

  const headersList = await headers();
  const userAgent = headersList.get('user-agent');

  return (
    <div>
      <h1>Organization: {orgId}</h1>
      <p>Active View: {view}</p>
      <p>Session Present: {sessionToken ? 'true' : 'false'}</p>
      <p>Client Agent: {userAgent}</p>
    </div>
  );
}
```

---

## 3. Client Component Consumption via React 19 `use()`

When a Client Component receives a `params` promise from a layout or parent, unwrap it using React 19's `use()` hook:

```tsx
'use client';

import { use } from 'react';

export function ClientProfileBadge({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  return <span class="badge">User: {username}</span>;
}
```

---

## 4. Cookie Mutation Invariants

In Server Components, `cookies()` is read-only.
Attempting to invoke `cookieStore.set()` or `cookieStore.delete()` during Server Component rendering throws a runtime error because HTTP response headers have already begun streaming to the browser.
Cookie writes must be executed exclusively inside **Server Actions** or **Route Handlers**.
