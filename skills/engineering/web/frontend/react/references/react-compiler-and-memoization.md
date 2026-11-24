# React 19 Architecture: React Compiler & Automated Memoization

A definitive technical reference on the React Compiler (formerly *React Forget*), automated memoization mechanics, compiler directives, and bailout resolution.

---

## 1. How the React Compiler Works

Historically, React re-rendered an entire component and all its children whenever state changed, unless developers manually wrapped calculations in `useMemo`, function declarations in `useCallback`, and child components in `React.memo`.

### Compile-Time Static Analysis
The React Compiler operates at the build step (Babel / Vite / Next.js) using static analysis:
1. **Control Flow & Effect Tracking**: Traces how values are created, modified, and passed through JSX trees.
2. **Fine-Grained Memoization Blocks**: Inserts reactive scope markers and caching primitives into the compiled output.
3. **Surgical Re-renders**: When a state variable changes, the compiled JavaScript executes only the specific JSX sub-expressions that depend on that variable. Unaffected child components skip re-rendering automatically.

---

## 2. Elimination of Manual Memoization Debt

### What to Stop Writing
In a React 19 codebase backed by the React Compiler:
- **Do NOT** wrap simple object literals or arrays in `useMemo`:
  ```typescript
  const filterOptions = { status: 'active', limit: 10 };
  ```
- **Do NOT** wrap event handlers in `useCallback`:
  ```typescript
  const handleClick = () => {
    saveRecord(recordId);
  };
  ```
- **Do NOT** wrap standard child components in `React.memo(MyComponent)`.

---

## 3. Compiler Directives & Escape Hatches

The React Compiler provides directives to control optimization at the file or function level:

### `'use memo';`
In projects adopting the compiler incrementally (opt-in mode), place `'use memo';` at the top of a file or function to instruct the compiler to optimize that specific component.

### `'use no memo';`
Acts as an emergency escape hatch. If legacy code relies on patterns that violate React's Rules of React (e.g. mutating objects after render, reading global mutable singletons during render), place `'use no memo';` inside the component body:

```tsx
function LegacyDashboardWidget() {
  'use no memo';
  return <div>Legacy rendering bypasses compiler</div>;
}
```

---

## 4. Troubleshooting Compiler Bailouts

The compiler will automatically skip optimizing a component (bail out) if it detects violations of React invariants:
- **Mutation of Props or Hook State**: Never mutate props or values returned by hooks.
- **Side Effects in Render**: Never trigger API calls, timers, or DOM mutations outside of event handlers or actions.
- **Conditional Hook Calls**: Hooks must remain unconditional at the top level (except the `use()` hook).
