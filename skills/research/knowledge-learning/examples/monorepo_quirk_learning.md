# Example: Monorepo Quirk Discovery and Knowledge Persistence

This example illustrates capturing an undocumented monorepo circular dependency restriction discovered during package scaffolding and registering it in `knowledge.json`.

---

## 1. Scenario: Silent Transitive Build Failure

An agent was tasked with adding a shared logger utility to a Turborepo monorepo.
Adding `"@acme/logger": "workspace:*"` to `packages/database/package.json` caused subsequent root builds to fail with:
```text
turbo: Dependency cycle detected: @acme/database -> @acme/logger -> @acme/config -> @acme/database
```

---

## 2. Root Cause Analysis

Inspecting `@acme/config` revealed that it transitively imported `@acme/database` for database configuration types.
Therefore, any core package (such as `@acme/logger`) that imports `@acme/config` cannot be imported by `@acme/database`.

---

## 3. Knowledge Card Creation

The agent writes `.gemini/knowledge/cards/KC-031-monorepo-core-dependency-cycle.md`:

````markdown
# Knowledge Card: Core Monorepo Cycle Boundary Rules

- **Card ID**: KC-031
- **Category**: architecture
- **Weight**: critical
- **Scope**: packages/**/*, turbo.json
- **Created**: 2026-11-03
- **Last Verified**: 2026-11-03
- **Status**: Active

## 1. Problem Context & Symptoms
Adding `@acme/logger` or any utility importing `@acme/config` directly into `@acme/database` triggers a cyclic build failure in Turborepo.

## 2. Root Cause
`@acme/config` depends on `@acme/database` for connection schema types. This creates a topological cycle whenever `@acme/database` imports a package built atop `@acme/config`.

## 3. Mandatory Invariant
Do not import `@acme/logger` or `@acme/config` directly into `@acme/database`. Use the zero-dependency `@acme/logger-core` sub-package inside the database adapter layer.

```json
{
  "dependencies": {
    "@acme/logger-core": "workspace:*"
  }
}
```

- ❌ Adding `@acme/config` or `@acme/logger` to `packages/database/package.json`.

## 4. Verification Proof
```bash
pnpm turbo run build --filter=@acme/database...
```
```text
• Packages in scope: @acme/database, @acme/logger-core
• Running build in 2 packages
  ✓ @acme/logger-core:build completed (120ms)
  ✓ @acme/database:build completed (280ms)
Tasks: 2 successful, 2 total
```
````

---

## 4. Registry Synchronization (`knowledge.json`)

Register the new card in `.gemini/knowledge/knowledge.json`:

```json
{
  "id": "KC-031",
  "title": "Core Monorepo Cycle Boundary Rules",
  "category": "architecture",
  "scope": "packages/**/*",
  "weight": "critical",
  "status": "Active",
  "path": "cards/KC-031-monorepo-core-dependency-cycle.md",
  "summary": "Never import @acme/logger or @acme/config into @acme/database; use @acme/logger-core.",
  "created_at": "2026-11-03",
  "last_verified": "2026-11-03",
  "verification_command": "pnpm turbo run build --filter=@acme/database..."
}
```
