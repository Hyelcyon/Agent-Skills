# Example: User Correction Learning Flow

This example demonstrates how an autonomous agent processes an explicit user correction, verifies the underlying constraint, writes an atomic knowledge card, and registers it in `knowledge.json`.

---

## 1. Interaction Trigger: User Correction

**User**:
> "Never run `npm test` or `vitest run` directly in this repo. Because of our native C++ binding build step, you must always run `pnpm test:native`—otherwise tests silently pass against a stale binary locally and blow up in CI."

---

## 2. Agent Operational Steps

### Step 1: Verification Against Workspace Configuration
The agent inspects `package.json` to confirm the user's assertion:
```bash
jq .scripts package.json
```
```json
{
  "test": "vitest run",
  "test:native": "pnpm build:bindings && vitest run --no-file-parallelism",
  "build:bindings": "node-gyp rebuild"
}
```

### Step 2: Extracting the Core Invariant
- **Trigger**: Running `vitest run` directly skips compiling native C++ bindings, masking regressions against stale `.node` binaries.
- **Scope**: `tests/**/*`, `package.json`.
- **Rule**: Never run `npm test` or `vitest run` directly; exclusively use `pnpm test:native`.

### Step 3: Codifying the Knowledge Card
The agent writes `.gemini/knowledge/cards/KC-014-native-binding-tests.md`:

````markdown
# Knowledge Card: Mandatory Native Binding Test Command

- **Card ID**: KC-014
- **Category**: test_harness
- **Weight**: critical
- **Scope**: tests/**/*, package.json
- **Created**: 2026-11-03
- **Last Verified**: 2026-11-03
- **Status**: Active

## 1. Problem Context & Symptoms
Running tests directly via `vitest run` or `npm test` skips recompiling local C++ bindings (`node-gyp rebuild`).
Tests pass locally against stale binary artifacts while failing deterministically on clean CI runners.

## 2. Root Cause
The default `test` script omits the pre-test native compilation step to keep single-file edits fast, whereas `test:native` rebuilds binaries and disables file parallelism (`--no-file-parallelism`) to avoid native module lock contention.

## 3. Mandatory Invariant
Always invoke the test suite using `pnpm test:native`. Never invoke raw `vitest` or `npm test`.

```bash
pnpm test:native
```

- ❌ `npm test`
- ❌ `npx vitest run`

## 4. Verification Proof
```bash
pnpm test:native
```
```text
> node-gyp rebuild
  SOLINK_MODULE(target) Release/addon.node
> vitest run --no-file-parallelism
  ✓ tests/binding.spec.ts (14 tests) 340ms
  Test Files  1 passed (1)
  Tests  14 passed (14)
```
````

### Step 4: Registry Synchronization (`knowledge.json`)
The agent appends the entry to `.gemini/knowledge/knowledge.json`:

```json
{
  "id": "KC-014",
  "title": "Mandatory Native Binding Test Command",
  "category": "test_harness",
  "scope": "tests/**/*",
  "weight": "critical",
  "status": "Active",
  "path": "cards/KC-014-native-binding-tests.md",
  "summary": "Always execute tests via pnpm test:native so C++ bindings rebuild before Vitest runs.",
  "created_at": "2026-11-03",
  "last_verified": "2026-11-03",
  "verification_command": "pnpm test:native"
}
```
Future sessions matching `tests/**/*` hydrate `KC-014` from `knowledge.json` and run `pnpm test:native` without re-prompting.
