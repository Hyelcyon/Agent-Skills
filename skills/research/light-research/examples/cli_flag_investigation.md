# CLI Flag Triage: Node.js Native TypeScript Type Stripping

## 1. Target Query
Which exact Node.js minor versions execute `.ts` files natively without third-party transpilers (`tsx`, `ts-node`)?

## 2. Verified Version Matrix
- **Node.js `v22.6.0` – `v22.17.x`**: Available behind `node --experimental-strip-types <file.ts>`.
- **Node.js `v22.18.0+`, `v23.6.0+`, and `v24+`**: Type stripping is **enabled by default** (`node <file.ts>` works directly without flags).
- **Syntax Scope**: Strips erasable TypeScript annotations only; non-erasable constructs (`enum`, `namespace` with runtime code, parameter properties) require `--experimental-transform-types` or `tsconfig.json` `"erasableSyntaxOnly": true`.
- **CI Rule**: Node.js strips types without type-checking; always pair runtime execution with `tsc --noEmit` in CI.
