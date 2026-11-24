# TypeScript Compiler Strictness and Performance Architecture

Architectural guidelines for configuring scalable, high-performance TypeScript project configurations, enforcing isolated declarations, and preventing compiler degradation in enterprise codebases.

## 1. Project References and Composite Builds

Large monorepos and multi-package projects must isolate compilation units using project references rather than monolithic type checking.

### Monorepo Root Configuration (`tsconfig.json`)

```json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/api" },
    { "path": "./packages/web" }
  ]
}
```

### Subproject Configuration (`packages/core/tsconfig.json`)

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "rootDir": "src",
    "outDir": "dist",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2024",
    "strict": true
  },
  "include": ["src"]
}
```

Enabling `composite` generates `.tsbuildinfo` files that track file modification hashes. This enables incremental compilation across dependent subprojects, reducing build times from minutes to milliseconds.

---

## 2. Isolated Declarations (`isolatedDeclarations`)

TypeScript 5.5+ introduced `isolatedDeclarations` to allow single-file code generators (such as oxc, swc, and esbuild) to emit declaration `.d.ts` files without running a full cross-file type-checker pass.

### Enforced Rules Under `isolatedDeclarations`

Every exported entity must have an explicit return type or type annotation. Inferred types on public boundaries are prohibited.

```typescript
export interface UserProfile {
  id: string;
  displayName: string;
  role: 'admin' | 'member';
}

export function buildUserProfile(id: string, name: string): UserProfile {
  return {
    id,
    displayName: name,
    role: 'member'
  };
}
```

If the explicit return type `UserProfile` is omitted, the compiler rejects the code because an external tool cannot determine the type without tracing all dependencies.

---

## 3. Native Type Stripping with `erasableSyntaxOnly`

Node.js 22.7+ and 23+ support native type stripping via `--experimental-strip-types`. To ensure source TypeScript files execute natively without transpilation errors, enable `erasableSyntaxOnly`:

```json
{
  "compilerOptions": {
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true
  }
}
```

### Forbidden Constructs Under Type Stripping

The following features produce runtime code during TypeScript compilation and cannot simply be erased:
- Enums (`enum Direction { Up, Down }`)
- Namespaces (`namespace Utility { ... }`)
- Class parameter properties (`constructor(public name: string)`)

Replace enums with `as const` object maps:

```typescript
export const Direction = {
  Up: 'UP',
  Down: 'DOWN',
  Left: 'LEFT',
  Right: 'RIGHT'
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];
```

---

## 4. Compiler Performance Bottlenecks and Mitigations

### Eliminating Deep Recursive Type Instantiations

Type checking performance degrades when complex conditional or mapped types exceed recursive depth limits.

Prefer interfaces and simple index signatures over nested intersections:

```typescript
export interface BaseEntity {
  id: string;
  createdAt: number;
}

export interface UserAccount extends BaseEntity {
  email: string;
  active: boolean;
}
```

Object interfaces create flat symbol tables that TypeScript caches efficiently, whereas intersections (`BaseEntity & { email: string }`) require dynamic type unification on every inspection.

### Optimization Checklist

- Set `skipLibCheck: true` in application projects to avoid re-checking third-party `.d.ts` files.
- Enable `noUncheckedIndexedAccess: true` to prevent unhandled `undefined` access bugs at compile time.
- Set `verbatimModuleSyntax: true` to guarantee predictable type-only import elision (`import type { Foo } from './foo'`).
