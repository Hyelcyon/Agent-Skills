# Case Study: Superficial Search vs. Multi-Hop Search

A side-by-side comparison demonstrating how superficial single-query searching causes silent regressions, while multi-hop search with falsification guarantees verified correctness.

---

## The Scenario

A developer asks the agent:
> *"We're building a Server Action form in our Next.js 15 App Router project. How should we manage form state and pending indicators in the client component?"*

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

## Anti-Pattern: Superficial Single-Query Search (The "대충 검색" Flaw)

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
import { useFormState } from 'react-dom'; // ❌ Deprecated in React 19!
import { myAction } from '@/actions/auth';

export function LoginForm() {
  // ❌ Deprecated in React 19:
  const [state, formAction] = useFormState(myAction, null);
  return <form action={formAction}>...</form>;
}
```

### 3. The Failure
When compiled, React 19 prints a deprecation warning:
`Warning: useFormState is deprecated. Use useActionState instead.`
Furthermore, the agent missed Next.js 15's native `<Form>` component introduced in `next/form`, which handles prefetching and client-side navigation automatically.

---

## The Multi-Hop Protocol: 3-Hop Multi-Query Search

### Step 1: Version-Locking & Boundary Formulation
The agent inspects `package.json` and notes:
- `next`: `15.1.0`
- `react`: `19.0.0`
The query must target React 19 and Next.js 15.

### Step 2: Multi-Hop Execution
- **Hop 1 (Discovery Query)**:
  ```text
  site:nextjs.org/docs/app "form state" 15
  ```
  Result identifies Next.js 15 documentation pointing to React 19 hooks and `next/form`.

- **Hop 2 (Deep Signature Extraction)**:
  ```text
  site:react.dev/reference/rsc "useActionState"
  ```
  Extracts the exact React 19 signature:
  `const [state, formAction, isPending] = useActionState(fn, initialState, permalink?)`
  *Key Discovery*: React 19's `useActionState` returns `isPending` directly as the 3rd element, eliminating the need for a separate child component with `useFormStatus`!

- **Hop 3 (Falsification & Deprecation Hunting)**:
  ```text
  "useFormState" "react 19" "deprecated" OR "breaking change"
  ```
  Confirmed: `useFormState` from `react-dom` is officially deprecated in React 19 and renamed to `useActionState` from `react`.

### Step 3: Empirical Scratch Verification
The agent verifies the import resolution:
```typescript
import { useActionState } from 'react';
// Verified: exported directly from 'react' in 19.0.0
```

### Step 4: The Verified Production Solution
```tsx
'use client';

import { useActionState } from 'react';
import Form from 'next/form';
import { loginAction } from '@/actions/auth';

const initialState = { error: null, success: false };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <Form action={formAction} className="space-y-4">
      <input name="email" type="email" required disabled={isPending} />
      <input name="password" type="password" required disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Sign In'}
      </button>
      {state.error && <p className="text-red-500">{state.error}</p>}
    </Form>
  );
}
```

### Conclusion
By executing the 3-hop verification cycle and actively falsifying `useFormState`, the agent:
1. Eliminated a deprecation warning before writing a single line of code.
2. Discovered that `isPending` is now built directly into `useActionState`.
3. Integrated Next.js 15's first-class `<Form>` primitive.
