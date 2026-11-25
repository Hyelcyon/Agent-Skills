---
name: typescript
description: Use when authoring or reviewing TypeScript 5.7/5.8+ code, configuring strict tsconfig options (erasableSyntaxOnly, isolatedDeclarations), implementing discriminated unions, using satisfies or as const assertions, or designing generic type utilities.
---

# Modern TypeScript Senior Engineering (TS 5.7 / 5.8+)

Enterprise standards and patterns for TypeScript 5.7+, enforcing strict single-file type-stripping compatibility, isolated declarations, and zero runtime type escapes.

## When to Use
- Designing domain models and state machines with Discriminated Unions.
- Enforcing strict compiler boundaries (`noUncheckedIndexedAccess`, `isolatedDeclarations`, `erasableSyntaxOnly`).
- Preventing literal widening with `as const` and validating contracts via `satisfies`.
- Eliminating unsafe `any`, unbounded type assertions (`as Type`), and runtime null surprises.

## When NOT to Use
- General web UI styling or layout design (use `html-css` or `ui-ux`).
- Backend HTTP framework setup without type design focus.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Compiler & Configuration Inspection (tsconfig.json, isolatedDeclarations)
Phase 2: Domain Boundary Definition (Discriminated Unions, as const, satisfies)
Phase 3: Zero-Unsafe-Escape Implementation (no any, no non-null assertions)
Phase 4: Generic & Narrowing Verification (Type guards, exhaustive switch)
Phase 5: Type-Check & Build Evidence (tsc --noEmit)
```

### Phase 1: Compiler & Configuration Inspection
Inspect `tsconfig.json` to verify strict flags: `strict: true`, `noUncheckedIndexedAccess: true`, `erasableSyntaxOnly: true` (required for Node 22.18+/24+/26+ native type-stripping), and `isolatedDeclarations: true` when authoring publishable libraries or shared monorepo packages.

### Phase 2: Domain Boundary Definition
Represent domain states with discriminated unions to make invalid states unrepresentable. Preserve literal types using `as const` and validate structure via `satisfies`:
```typescript
type Result<T> =
  | { status: 'success'; data: T }
  | { status: 'failure'; error: Error };
```

### Phase 3: Zero-Unsafe-Escape Implementation
Prohibit `any` and non-null assertion `!`. Replace loose types with `unknown` and narrow using custom type guards or structural pattern matching.

### Phase 4: Generic & Narrowing Verification
Ensure all switch statements on discriminated unions are exhaustive via `never` assignment. Guard index lookups for `undefined`:
```typescript
function handleResult<T>(result: Result<T>): string {
  switch (result.status) {
    case 'success':
      return 'OK';
    case 'failure':
      return result.error.message;
    default: {
      const exhaustiveCheck: never = result;
      return exhaustiveCheck;
    }
  }
}
```

### Phase 5: Type-Check & Build Evidence
Execute type validation commands and ensure zero type errors:
```bash
npx tsc --noEmit
```

---

## Prohibited Anti-Patterns & Fatal Mistakes

- ❌ Using `any` or silencing compiler diagnostics with bare `@ts-ignore` (use `unknown` + narrowing).
- ❌ Casting unvalidated `JSON.parse()` / HTTP payloads directly `as DomainType` without runtime validation.
- ❌ Non-null assertion operator `!` (use explicit guard statements).
- ❌ TypeScript-only runtime constructs like `enum`, parameter properties, or `namespace` (breaks `erasableSyntaxOnly`).
- ❌ Empty interfaces (`interface Foo {}`) or implicit index signature lookups without undefined checks.

---

## References & Documentation
- Advanced Implementation Playbook: [references/implementation-playbook.md](./references/implementation-playbook.md)
- Advanced Type System & Generics: [references/advanced-type-system-and-generics.md](./references/advanced-type-system-and-generics.md)
- Compiler Strictness & Performance: [references/compiler-strictness-and-performance.md](./references/compiler-strictness-and-performance.md)

## Resources & Examples
- Strict TSConfig Starter: [resources/tsconfig.strict.json](./resources/tsconfig.strict.json)
- Library TSConfig Starter: [resources/tsconfig.library.json](./resources/tsconfig.library.json)
- Type-Level Testing Utilities: [resources/type-testing-template.ts](./resources/type-testing-template.ts)
- Discriminated Union Example: [examples/discriminated_union_example.ts](./examples/discriminated_union_example.ts)
- Branded Types Validation Example: [examples/brand_types_validation.ts](./examples/brand_types_validation.ts)
- Exhaustiveness Check Example: [examples/exhaustiveness_check.ts](./examples/exhaustiveness_check.ts)
