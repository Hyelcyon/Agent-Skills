# Node.js Native TypeScript and Type Stripping

Technical guide for executing TypeScript natively in modern Node.js using type stripping without external transpilation tooling.

---

## 1. The Type Stripping Execution Model

Node.js provides native execution of `.ts`, `.mts`, and `.cts` files via type stripping:
- **Zero Transpilation Overhead**: The runtime strips type annotations, interfaces, and type imports in memory during parse time.
- **No Source Maps Desync**: Because type stripping only replaces type annotations with whitespace, line and column numbers in error stack traces map directly to the original TypeScript source file.
- **Elimination of Third-Party Launchers**: Removes the need for `ts-node`, `tsx`, or `babel-node` in local scripts, automation tasks, and microservices.

---

## 2. CLI Execution Flags

Execute TypeScript files directly using the runtime flag:

```bash
node --experimental-strip-types server.ts
```

For codebases that require runtime transformation of TypeScript-only constructs (such as `enum` or legacy `namespace`), enable:

```bash
node --experimental-transform-types server.ts
```

---

## 3. Recommended TypeScript Syntax for Type Stripping

To ensure zero-friction execution with native type stripping:
- Prefer `const` objects and union types over TypeScript `enum`:
  ```typescript
  export const UserRole = {
    Admin: 'ADMIN',
    User: 'USER'
  } as const;

  export type UserRole = (typeof UserRole)[keyof typeof UserRole];
  ```
- Use explicit type-only imports:
  ```typescript
  import type { Request, Response } from 'express';
  import { createServer } from 'node:http';
  ```

---

## 4. Separation of Execution and Verification

Native type stripping does not perform type checking. Production CI/CD pipelines must separate runtime execution from static analysis:

```json
{
  "scripts": {
    "start": "node --experimental-strip-types src/index.ts",
    "typecheck": "tsc --noEmit",
    "test": "node --test --experimental-strip-types \"tests/**/*.test.ts\""
  }
}
```
