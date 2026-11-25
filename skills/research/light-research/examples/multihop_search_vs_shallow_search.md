# Case Study: Superficial Search vs. Multi-Hop Search

A side-by-side comparison demonstrating how superficial single-query searching causes silent regressions, while multi-hop search with falsification guarantees verified correctness.

---

## The Scenario

A developer asks the agent:
> *"We're building a Server Action login form in our Next.js 15 App Router project. How should we manage form state and pending indicators in the client component?"*

The project's `package.json` contains:
```json
{
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

---

## Anti-Pattern: Superficial Single-Query Search (The "Quick-Glance" Flaw)

### 1. The Execution
The agent thinks: *"I know how to handle form state in React."*
To double-check, it executes a single generic query:
```text
Query: "nextjs app router server actions form state"
```
It glances at the top search snippet from a 2023 tutorial:
> *"Use the `useFormState` hook from `react-dom` to manage server action state, and `useFormStatus` to show a loading indicator."*

### 2. The Resulting Code (Broken & Deprecated)
```tsx
'use client';
import { useFormState } from 'react-dom'; // ❌ Deprecated in React 19
import { loginAction } from '@/actions/auth';

export function LoginForm() {
  // ❌ Deprecated in React 19; renamed to useActionState in 'react'
  const [state, formAction] = useFormState(loginAction, null);
  return <form action={formAction}>...</form>;
}
```

### 3. The Failure
React 19 deprecates `useFormState` (`react-dom`) in favor of `useActionState` (`react`), which also returns `isPending` directly as its third tuple element. Furthermore, blindly substituting Next.js 15's `<Form>` (`next/form`) for a Server Action POST mutation adds no prefetching (which only applies when `action` is a string URL path such as `action="/search"`).

---

## The Multi-Hop Protocol: 3-Hop Multi-Query Search

### Step 1: Version-Locking & Boundary Formulation
The agent inspects `package.json` and notes:
- `next`: `15.1.0`
- `react`: `19.0.0`
Queries must explicitly anchor to React 19 and Next.js 15.

### Step 2: Multi-Hop Execution
- **Hop 1 (Discovery Query)**:
  ```text
  site:nextjs.org/docs/app "Server Actions" "useActionState" 15
  ```
  Result identifies Next.js 15 App Router guidance pointing to React 19's `useActionState` hook (and distinguishes URL-based `<Form action="/search">` from function-based Server Actions).

- **Hop 2 (Deep Signature Extraction)**:
  ```text
  site:react.dev/reference/react "useActionState"
  ```
  Extracts the exact React 19 signature:
  `const [state, formAction, isPending] = useActionState(fn, initialState, permalink?)`
  *Key Discovery*: `useActionState` returns `isPending` directly as the third tuple element, eliminating the need for a separate child component calling `useFormStatus`.

- **Hop 3 (Falsification & Deprecation Hunting)**:
  ```text
  "useFormState" "react 19" "deprecated" OR "breaking change"
  ```
  Confirmed: `useFormState` from `react-dom` is officially deprecated in React 19 and replaced by `useActionState` imported from `react`.

### Step 3: Empirical Scratch Verification
The agent verifies the import resolution against the installed `react` types:
```typescript
import { useActionState } from 'react';
// Verified: exported directly from 'react' in 19.0.0 with 3-tuple return
```

### Step 4: The Verified Production Solution
```tsx
'use client';

import { useActionState } from 'react';
import { loginAction, type AuthFormState } from '@/actions/auth';

const initialState: AuthFormState = { error: null, success: false };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input name="email" type="email" required disabled={isPending} />
      <input name="password" type="password" required disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Sign In'}
      </button>
      {state.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
}
```

### Conclusion
By executing the 3-hop verification cycle and actively falsifying `useFormState`, the agent:
1. Eliminated a React 19 deprecation before writing code.
2. Used `isPending` directly from `useActionState` instead of extra `useFormStatus` wrapper components.
3. Kept standard `<form action={formAction}>` semantics accurate for Server Action mutations instead of misapplying `next/form` prefetching claims.
