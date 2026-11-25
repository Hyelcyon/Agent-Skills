# React 19 Architecture: Performance Profiling & Anti-Patterns

A senior engineering guide to diagnosing performance bottlenecks, React DevTools Profiler flamegraph analysis, hydration error resolution, and eliminating the top 10 React anti-patterns.

---

## 1. Profiling with React DevTools

### Flamegraph vs Ranked Chart
- **Flamegraph**: Displays the component tree hierarchy for a specific commit. Color coding indicates how long each component took to render:
  - Yellow/Red: Slow render duration ($> 16\text{ms}$, risking frame drops below 60fps).
  - Blue/Gray: Fast render or skipped render.
- **Ranked Chart**: Orders components purely by render duration, immediately surfacing the single most expensive component in the tree.

### Inspecting "Why Did This Render?"
Enable *"Record why each component rendered while profiling"* in React DevTools settings. The profiler explicitly notes:
- *Props changed*
- *Hooks changed (State)*
- *Parent component re-rendered*

---

## 2. Diagnosing Hydration Mismatches

Hydration errors occur when the server-rendered HTML does not match the client's initial render tree:

### Common Causes & Fixes
1. **Reading Browser-Only State During Server Render**:
   - `window.innerWidth`, `localStorage.getItem()`, or navigator language differ between Node and browser.
   - **Fix**: Delay reading browser APIs until an effect runs or use a custom hook with an `isMounted` state.
2. **Timestamp & Random Number Inconsistencies**:
   - Rendering `new Date().toLocaleTimeString()` or `Math.random()` produces different strings on server and client.
   - **Fix**: Pass the initial server timestamp as a prop from the Server Component.
3. **Invalid HTML Nesting**:
   - Nesting a `<div>` inside a `<p>`, or an `<a>` inside an `<a>`. Browsers silently auto-correct invalid HTML before React hydrates, causing React's tree comparison to mismatch.

---

## 3. The Top 10 React Anti-Patterns to Eliminate

1. ❌ **`useEffect` Data Waterfalls**: Calling `fetch` inside `useEffect` on mount.
2. ❌ **Manual Memoization Clutter**: Littering code with unneeded `useCallback` under the React Compiler.
3. ❌ **Root-Level `'use client'`**: Putting `'use client'` in layouts or page roots.
4. ❌ **Context as a High-Frequency Store**: Storing streaming ticks or mouse coordinates in React Context.
5. ❌ **Array Index as Key**: Using `key={index}` on lists subject to sorting, filtering, or deletion. Always use stable unique IDs (`item.id`).
6. ❌ **Direct State Mutation**: Calling `items.push()` or `user.active = true` instead of creating immutable updates.
7. ❌ **Passing Inline Arrow Functions to High-Frequency Listeners**: Attaching non-passive unmemoized inline listeners to `window.scroll`.
8. ❌ **Missing Effect Cleanups**: Forgetting to return a cleanup function from `useEffect` when subscribing to WebSockets, intervals, or event listeners.
9. ❌ **Wrapped `forwardRef`**: Continuing to wrap components in `forwardRef` in React 19 codebases.
10. ❌ **Derived State Stored in `useState`**: Syncing prop changes into local state via an effect instead of calculating inline during render.
11. ❌ **Sequential Async Waterfalls & Heavy Barrel Imports**: Chaining unrelated `await`s instead of `Promise.all()`, or pulling whole icon/chart barrel indexes instead of direct imports + `React.lazy()`.
12. ❌ **Boolean-Prop Monoliths**: Multiplying `is*`/`has*`/`show*` flags on shared components instead of Compound Component sub-slots.
