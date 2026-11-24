# React 19 Architecture: Modern Hooks & Lifecycle Engineering

A senior runbook covering the `use()` hook, concurrency primitives, direct `ref` props, and the eradication of `useEffect` anti-patterns.

---

## 1. The Universal `use()` Hook

The `use()` hook reads the value of a resource (a Promise or a React Context) directly within render functions:

### Reading Promises with Suspense Integration
Unlike other hooks, `use()` can be invoked conditionally inside loops and `if` branches:

```tsx
import { use, Suspense } from 'react';

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <div>Welcome, {user.name}</div>;
}

export function ProfilePage() {
  const userPromise = fetchUser();
  return (
    <Suspense fallback={<p>Loading profile...</p>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

### Conditional Context Reading
```tsx
function NotificationBell({ isEnabled }: { isEnabled: boolean }) {
  if (!isEnabled) {
    return null;
  }
  const theme = use(ThemeContext);
  return <span style={{ color: theme.primary }}>🔔</span>;
}
```

---

## 2. Concurrency Primitives: `useTransition` & `useDeferredValue`

Prevent UI blocking during heavy rendering updates:

### `useTransition` for Non-Blocking Navigation & Filtering
Marks a state update as non-urgent. If a user interrupts the transition with another click, React discards the intermediate render:

```tsx
const [isPending, startTransition] = useTransition();

const handleFilterChange = (category: string) => {
  startTransition(() => {
    setActiveCategory(category);
  });
};
```

### `useDeferredValue` for Expensive Child Render Trees
Defers updating a value until urgent renders (like text input keystrokes) complete:

```tsx
function SearchPage({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  return <HeavySearchResults query={deferredQuery} />;
}
```

---

## 3. Direct `ref` Passing (Deprecation of `forwardRef`)

In React 19, `ref` is a standard component prop. Components no longer need to be wrapped in `forwardRef`:

```tsx
interface TextInputProps {
  label: string;
  ref?: React.Ref<HTMLInputElement>;
}

export function TextInput({ label, ref }: TextInputProps) {
  return (
    <label>
      {label}
      <input ref={ref} />
    </label>
  );
}
```

---

## 4. Eradicating `useEffect` Anti-Patterns

### ❌ Anti-Pattern: `useEffect` for Synchronizing State
```tsx
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```
- **The Senior Fix**: Calculate during render:
  ```tsx
  const fullName = `${firstName} ${lastName}`;
  ```

### ❌ Anti-Pattern: `useEffect` for Data Fetching
- Leads to race conditions, missing cancellation, and waterfall waterfalls.
- **The Senior Fix**: Fetch in Server Components, use the `use()` hook with Promises, or use TanStack Query v5.
