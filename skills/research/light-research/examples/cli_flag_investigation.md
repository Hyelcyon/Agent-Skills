# CLI Flag Triage: Node.js `--experimental-strip-types`

## 1. Target Query
Does Node.js v22 execute TypeScript without third-party build tools?

## 2. Findings
- Flag: `node --experimental-strip-types <file.ts>`
- Scope: Strips type annotations; does not perform runtime type checking or compilation of TS enums/namespaces.
- Production Rule: Pair with `tsc --noEmit` in CI pipeline for static analysis.
