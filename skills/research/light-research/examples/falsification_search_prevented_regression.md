# Case Study: How Falsification Search Prevented a Silent Production Crash

A demonstration of how falsification probing catches asynchronous contract breaking changes before they break builds.

---

## The Scenario

An agent is asked to implement an authenticated route handler in a Next.js 15 project:
> *"Extract the session token from cookies in a Server Component or Route Handler and fetch user profile data."*

The local environment is:
- `next`: `15.1.2`
- `node`: `22.11.0`

---

## What a Superficial Agent Does (The Crash)

The agent remembers Next.js 14 conventions:
```typescript
// ❌ WRONG in Next.js 15: Synchronous cookies() call
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('session_token')?.value;
  // ...
}
```

If it executes a superficial search like:
```text
Query: "nextjs read cookies in route handler"
```
The search returns dozens of StackOverflow posts, Medium tutorials, and outdated blog articles from 2023-2024 showing synchronous `cookies().get()`.

### The Runtime Error in Next.js 15
```text
Error: Route /api/profile used `cookies().get()`. `cookies()` should be awaited before using its value.
See more info here: https://nextjs.org/docs/messages/sync-dynamic-apis
```
In Next.js 15, `cookies()`, `headers()`, `params`, and `searchParams` were converted to asynchronous Promises. Accessing them synchronously throws a runtime deprecation warning and causes production build failures when opting into dynamic rendering.

---

## How Multi-Hop Falsification Search Prevents This

### Step 1: Version Lockstep
The agent checks `package.json` -> `next: "^15.1.2"`.

### Step 2: Formulating the Falsification Query
The agent knows Next.js 15 is a major release. Rather than asking "how to read cookies", it specifically probes for breaking changes:
```text
Query: "cookies" "nextjs 15" "breaking change" OR "async" OR "deprecated"
```

### Step 3: Upstream Extraction
The search returns the official Next.js 15 Upgrade Guide (`nextjs.org/docs/app/building-your-application/upgrading/version-15`):
> *"Async Request APIs: In Next.js 15, `cookies`, `headers`, `params`, and `searchParams` are transitioning from synchronous to asynchronous execution. You must `await cookies()`."*

### Step 4: The Verified Implementation
```typescript
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  // ✅ Correct Next.js 15: Awaited cookies Promise
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
```

### Result
Zero runtime warnings. Zero build failures. The agent delivered code aligned with the exact major version semantics.
