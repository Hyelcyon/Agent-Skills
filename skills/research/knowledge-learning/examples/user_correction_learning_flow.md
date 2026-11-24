# Example: User Correction Learning Flow

This example demonstrates how an autonomous agent processes an explicit user correction, verifies the underlying constraint, and distills it into an atomic knowledge card.

---

## 1. Interaction Trigger: User Correction

**User**:
> "우리 레포에서는 `npm test`나 `vitest run` 직접 치지 마. C++ 네이티브 바인딩 빌드 때문에 항상 `pnpm test:native`로 실행해야 해. 안 그러면 stale binary 때문에 조용히 통과해서 나중에 CI 터진다."

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
  "test:native": "pnpm build:bindings && vitest run --runInBand",
  "build:bindings": "node-gyp rebuild"
}
```

### Step 2: Extracting the Core Invariant
- **Trigger**: Running tests directly skips compiling native bindings, masking regressions.
- **Scope**: Entire repository test suite.
- **Rule**: Never run `npm test` or `vitest run` directly; exclusively use `pnpm test:native`.

### Step 3: Codifying the Knowledge Card
The agent authors `.gemini/knowledge/KC-014-native-binding-tests.md`:

```markdown
# Knowledge Card: Mandatory Native Binding Test Command

- **Card ID**: KC-014
- **Category**: test_harness
- **Scope**: tests/**/*, package.json
- **Created**: 2026-11-03
- **Last Verified**: 2026-11-03
- **Status**: Active

## 1. Problem Context & Symptoms
Running tests directly via `vitest run` or `npm test` skips recompiling local C++ bindings (`node-gyp rebuild`).
Tests may pass against stale binary artifacts locally, leading to deterministic failures in fresh CI runners.

## 2. Root Cause
The standard `test` script does not declare a pre-test compilation hook to optimize local iteration, but requires explicit binding synchronization before executing unit assertions.

## 3. Mandatory Invariant
Always invoke the test suite using `pnpm test:native`. Never invoke raw vitest or npm test.

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
> vitest run --runInBand
  ✓ test/binding.spec.ts (14 tests) 340ms
  Test Files  1 passed (1)
  Tests  14 passed (14)
```
```

### Step 4: Index Registration
The agent appends the new entry to `.gemini/knowledge/INDEX.md`.
Future sessions reading the index will immediately use `pnpm test:native` without prompting.
