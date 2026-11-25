---
name: javascript
description: Use when writing or reviewing modern JavaScript (ES2024 - ES2026+), utilizing Temporal API for dates, Promise.withResolvers, native Set algebra, Object/Map.groupBy, explicit resource management (using), or modern ESM standards.
---

# Modern JavaScript Senior Engineering (ES2024 - ES2026+)

Senior engineering standards and idioms for high-performance, resilient JavaScript, emphasizing native ECMAScript standard library features, immutable collections, and deterministic resource lifecycles.

## When to Use
- Writing native ECMAScript 2024+ code using ESM syntax.
- Handling timezone-aware datetime calculations using the Temporal API.
- Simplifying asynchronous synchronization with `Promise.withResolvers()`.
- Performing Set operations (`union`, `intersection`, `difference`) without external utility libraries.
- Grouping collections with `Object.groupBy` or `Map.groupBy`.
- Managing lifecycle cleanup using `using` and `Symbol.dispose`.

## When NOT to Use
- TypeScript-specific compiler configuration and type narrowing (use `typescript`).
- Browser DOM styling or layout design (use `html-css`).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Environment & Module Boundary Inspection
Phase 2: Modern Standard Library Selection (No Lodash/Moment Bloat)
Phase 3: Clean Implementation & Immutability Enforcement
Phase 4: Async Safety & Resource Management
Phase 5: Linter & Engine Verification
```

### Phase 1: Environment & Module Boundaries
Verify that `package.json` declares `"type": "module"` and targets modern engines (`node >= 22.0.0`). Avoid CommonJS `require()` in new code.

### Phase 2: Modern Standard Library Selection
Reject legacy third-party dependencies for tasks natively supported by modern ECMAScript:
- Replace `moment` / `dayjs` with `Temporal` (Use `@js-temporal/polyfill` on Node.js 22 LTS; natively enabled out-of-the-box on Node 26+).
- Replace `lodash.groupBy` with `Object.groupBy` or `Map.groupBy`.
- Replace custom set intersection loops with `Set.prototype.intersection`.

### Phase 3: Clean Implementation & Immutability
Use non-mutating array operations (`toSorted`, `toReversed`, `toSpliced`, `with`) to prevent accidental state mutation in shared memory:
```javascript
const items = ['banana', 'apple', 'cherry'];
const sorted = items.toSorted();
const replaced = sorted.with(0, 'apricot');
```

### Phase 4: Async Safety & Resource Management
Manage unhandled rejections with `Promise.withResolvers()` and guarantee cleanup via `using`:
```javascript
const { promise, resolve, reject } = Promise.withResolvers();
```

### Phase 5: Linter & Engine Verification
Verify code against the modern ESLint flat configuration and check with `node --test`:
```bash
npx eslint src/
node --test 'tests/**/*.test.js'
```

---

## Prohibited Anti-Patterns

- ❌ Using legacy `Date` for business logic (Use `Temporal`).
- ❌ Using `var` (Standardize strictly on `const` and `let`).
- ❌ Using `==` loose equality (Standardize strictly on `===`).
- ❌ Mutating arrays in-place when calculating derived state.
- ❌ Wrapping promises manually when `Promise.withResolvers()` is available.

---

## References & Documentation
- Modern ECMAScript Features: [references/modern-ecmascript-features.md](./references/modern-ecmascript-features.md)
- Temporal API & Date Handling: [references/temporal-api-and-date-handling.md](./references/temporal-api-and-date-handling.md)
- Async Control Flow & Resource Management: [references/async-control-flow-and-resource-management.md](./references/async-control-flow-and-resource-management.md)

## Resources & Examples
- ESM Package Template: [resources/package-esm.template.json](./resources/package-esm.template.json)
- ESLint Strict Config: [resources/eslint.strict.config.mjs](./resources/eslint.strict.config.mjs)
- Strict JSConfig Definition: [resources/jsconfig.strict.json](./resources/jsconfig.strict.json)
- Temporal Scheduler Example: [examples/temporal_scheduler_example.js](./examples/temporal_scheduler_example.js)
- Set Algebra Policy Engine: [examples/set_algebra_pipeline.js](./examples/set_algebra_pipeline.js)
- Async Resolvers Queue: [examples/promise_resolvers_channel.js](./examples/promise_resolvers_channel.js)
