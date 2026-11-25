---
name: example-skill
description: Use when performing <specific domain workflow>, diagnosing <concrete failure modes>, or modifying <target files>. Do NOT use for <out-of-scope alternative>.
---

# Domain Skill Title

Concise engineering standards, failure prevention, and operational runbook for this domain.

## When to Use
- Specific scenario A (include concrete triggers, error strings, or config files).
- Specific scenario B.

## When NOT to Use
- Out-of-scope alternative (link or name the sibling skill to route to instead).

---

## Fatal Mistakes Never to Make
- **Never guess runtime behavior or skip root-cause tracing**: Read actual callers, types, and errors before editing.
- **Never run blocking long-lived processes synchronously**: Use `--dry-run`, bounded checks, or `IsDaemon` for servers/watchers.
- **Never fabricate verification results**: Execute concrete build/test commands after the final edit and inspect exact output.

---

## 1. 5-Phase Agent Operational Protocol

```text
[Phase 1: Profile] -> [Phase 2: Boundaries] -> [Phase 3: Minimal Fix] -> [Phase 4: Verify] -> [Phase 5: Proof]
```

### Phase 1: Environment & Dependency Profiling
Inspect workspace manifests, lockfiles, runtime versions, and relevant callers before modifying files.

### Phase 2: Safety & Boundary Shielding
Verify input validation, secret isolation, permissions, and backwards-compatibility invariants.

### Phase 3: Surgical Implementation
Apply the smallest coherent change solving the root cause using standard project/runtime idioms.

### Phase 4: Verification Gate
Run the domain's real compiler, type-checker, linter, or unit tests after the final edit.

### Phase 5: Transparent Completion Proof
Report exact commands run, observed exit codes, and changed file paths.

---

## References & Resources
- Architectural Reference: `[references/reference.md](./references/reference.md)`
- Production Template: `[resources/config.json](./resources/config.json)`
- Verified Example: `[examples/example.ts](./examples/example.ts)`
