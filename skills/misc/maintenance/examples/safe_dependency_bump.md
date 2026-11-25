# Example: Safe Major Dependency Bump

## Scenario
Upgrading `zod` from `3.x` to `4.x` inside an API service without breaking request validation or coupling unrelated package bumps.

## Protocol
1. **Baseline**: Confirm `pnpm exec tsc --noEmit && pnpm test` passes before editing.
2. **Breaking-Change Falsification**: Inspect official migration notes (`z.string().uuid()` deprecated in favor of top-level `z.uuid()`, stricter `z.record(key, value)`).
3. **Isolated Bump**: Update only `zod` + `pnpm-lock.yaml` (`pnpm add zod@^4`).
4. **Caller Migration**: Grep all `z.` call sites, update deprecated validators, and keep error response shapes identical.
5. **Gate**: Re-run `pnpm exec tsc --noEmit && pnpm lint && pnpm test && pnpm build` and inspect the diff.
