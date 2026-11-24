# Example: Standard Library over External Dependency

## Scenario
A project requires deep cloning of an object graph and array deduplication.

## Anti-Pattern (Dependency Bloat)
Adding `lodash` or `ramda` to `package.json`:
```bash
pnpm add lodash
pnpm add -D @types/lodash
```
```typescript
import cloneDeep from 'lodash/cloneDeep';
import uniq from 'lodash/uniq';
```

## Senior Approach (Native Runtime Features)
Leverage modern standard library APIs (ES2024+):
```typescript
const cloned = structuredClone(payload);
const uniqueItems = Array.from(new Set(items));
```
Result: Zero package bundle overhead, zero security vulnerability surface, zero install lag.
