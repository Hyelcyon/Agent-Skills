---
name: maintenance
description: Use when maintaining an existing codebase, upgrading dependencies safely, pruning dead code or stale comments, executing behavior-preserving refactors, triaging technical debt, or hardening post-incident regressions. Do NOT use for greenfield feature architecture (use architecture or design-taste) or database schema DDL migrations (use migration).
---

# Software Maintenance & Long-Term Codebase Stewardship

Senior engineering runbook for keeping live codebases healthy without regressions: safe dependency upgrades, characterization-backed refactoring, dead-code pruning, and continuous tech-debt triage.

## When to Use
- Upgrading runtime versions, frameworks, or lockfile dependencies safely.
- Refactoring coupled modules while preserving public contracts and existing callers.
- Auditing and removing dead code, unused exports, stale feature flags, or obsolete comments.
- Triaging technical debt or turning resolved production bugs into permanent regression guards.

## When NOT to Use
- Zero-downtime database DDL migrations (use `migration`).
- Greenfield UI art direction (use `design-taste`) or Antigravity manifest auditing (use `antigravity-skills-manager`).

---

## Fatal Mistakes Never to Make

- **Never upgrade major dependencies blindly**: Never bump major versions or run unpinned updates without reading changelogs/breaking changes, checking lockfile diffs, and verifying full tests + build.
- **Never refactor without a characterization safety net**: If target behavior lacks automated coverage, write characterization tests confirming current observable outputs *before* moving code.
- **Never delete "unused" exports without dynamic-reference checks**: Grep for string-based routes, config keys, CLI entrypoints, reflection, and `package.json` `exports` before removing symbols.
- **Never expand scope into unrelated cleanup**: Keep maintenance diffs surgical; never reformat or rename untouched files alongside a targeted fix.
- **Never leave stale comments or half-retired shims**: Update or delete adjacent comments and `.gemini/knowledge/` cards whenever invariants change.

---

## 5-Phase Agent Operational Protocol

```text
Phase 1: Blast-Radius & Health Profiling (Lockfiles, callers, tests, knowledge.json)
Phase 2: Characterization Safety Net (Verify green baseline or add fail-safe tests)
Phase 3: Surgical Maintenance Execution (Upgrades, contract-safe refactor, dead-code prune)
Phase 4: Full Regression & Hygiene Gate (Build, types, lint, test, diff audit)
Phase 5: Knowledge Persistence & Handoff Proof (Update knowledge cards, report real metrics)
```

### Phase 1: Blast-Radius & Health Profiling
Inspect manifests (`package.json`, `pyproject.toml`, `Cargo.toml`), lockfiles, CI workflows, and `.gemini/knowledge/knowledge.json`. Trace every caller of the target module before editing.

### Phase 2: Characterization Safety Net
Run the existing test suite first to establish a clean baseline. If the code under maintenance has no tests, add minimal black-box characterization tests pinning its current public behavior.

### Phase 3: Surgical Maintenance Execution
- **Dependencies**: Upgrade one cohesive group at a time; check breaking changes per [references/dependency-and-upgrade-hygiene.md](./references/dependency-and-upgrade-hygiene.md).
- **Refactors & Pruning**: Apply Expand-Contract for public APIs and delete verified dead code cleanly per [references/safe-refactoring-and-dead-code-pruning.md](./references/safe-refactoring-and-dead-code-pruning.md).

### Phase 4: Full Regression & Hygiene Gate
Run the project's full type-checker, linter, build, and test suite after the final edit. Verify `git diff` / changed files contain zero debug prints, temporary scripts, or stale comments.

### Phase 5: Knowledge Persistence & Handoff Proof
Capture non-obvious quirks or retired workarounds via `knowledge-learning` ([references/continuous-health-and-incident-prevention.md](./references/continuous-health-and-incident-prevention.md)) and report exact executed commands, counts, and residual risks.

---

## References, Resources & Examples
- Dependency & Upgrade Hygiene: [references/dependency-and-upgrade-hygiene.md](./references/dependency-and-upgrade-hygiene.md)
- Safe Refactoring & Dead-Code Pruning: [references/safe-refactoring-and-dead-code-pruning.md](./references/safe-refactoring-and-dead-code-pruning.md)
- Continuous Health & Incident Prevention: [references/continuous-health-and-incident-prevention.md](./references/continuous-health-and-incident-prevention.md)
- Maintenance Plan Template: [resources/maintenance-plan.template.md](./resources/maintenance-plan.template.md)
- Dependency Upgrade Gate JSON: [resources/dependency-upgrade-checklist.json](./resources/dependency-upgrade-checklist.json)
- Tech-Debt Triage Matrix: [resources/tech-debt-triage-matrix.md](./resources/tech-debt-triage-matrix.md)
- Safe Dependency Bump Walkthrough: [examples/safe_dependency_bump.md](./examples/safe_dependency_bump.md)
- Unused Export & Stale Config Auditor: [examples/dead_code_and_caller_audit.ts](./examples/dead_code_and_caller_audit.ts)
- Characterization Before Refactor Example: [examples/characterization_before_refactor.md](./examples/characterization_before_refactor.md)
