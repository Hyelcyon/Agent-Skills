# Example: Minimal Diff Refactor

## Scenario
A function requires an extra parameter to support tenant filtering while maintaining compatibility with legacy callers.

## Anti-Pattern (Bloated Rewrite)
Rewriting the entire function into a class or introducing an options object that breaks all existing callers:
```typescript
interface QueryOptions {
  tenantId?: string;
  limit?: number;
  offset?: number;
}

class UserQueryService {
  constructor(private readonly options: QueryOptions) {}
  execute() { /* 50 lines of boilerplate */ }
}
```

## Senior Minimal Diff
```typescript
export function findUsers(query: string, tenantId?: string): User[] {
  return db.users.filter(u => u.name.includes(query) && (!tenantId || u.tenantId === tenantId));
}
```
Zero disruption to existing callers, zero new classes, exact preservation of existing types.
