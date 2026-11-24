---
name: pnpm
description: Use when managing dependencies with pnpm, configuring pnpm-workspace.yaml, setting up Catalogs, enforcing strict non-flat node_modules isolation, or executing monorepo filter commands.
---

# Enterprise pnpm Architecture & Agent Operational Runbook

Standard operational protocol for autonomous agents managing pnpm workspaces, non-flat dependency isolation, Catalogs, selective filter commands, and CI lockfile freezing.

## When to Use
- Orchestrating monorepo multi-package projects via `pnpm-workspace.yaml`.
- Enforcing strict dependency isolation and eliminating phantom dependencies.
- Configuring shared versions via the pnpm Catalogs feature.
- Running targeted tasks using `--filter` syntax (`pnpm --filter ...@scope/pkg`).
- Setting up CI pipeline installs with `--frozen-lockfile`.

## When NOT to Use
- Authoring package.json conditional export maps or publishing to registry (use `npm`).
- Building and bundling client application source code (use `vite`).

---

## 1. Autonomous Agent Operational Protocol

When working on a pnpm-managed project or monorepo, the agent must execute these 5 sequential phases:

```
[Phase 1: Environment Alignment] ──> [Phase 2: Topology Discovery] ──> [Phase 3: Dependency Resolution] ──> [Phase 4: Filtered Execution] ──> [Phase 5: Integrity Verification]
     Match packageManager             Inspect pnpm-workspace.yaml          Enforce workspace:*                 Target changed packages        Verify frozen lockfile
```

### Phase 1: Environment & Version Alignment
1. Read `package.json` to inspect the `packageManager` field (e.g. `pnpm@9.15.0`).
2. Verify Corepack or local pnpm matches the declared version to avoid lockfile schema churn.
3. Verify `.npmrc` has `shamefully-hoist=false` to preserve symlink isolation.

### Phase 2: Monorepo Topology Discovery
1. Read `pnpm-workspace.yaml` to discover package glob patterns (`apps/*`, `packages/*`).
2. Identify internal inter-package dependencies and ensure they utilize the `workspace:*` protocol:
   ```json
   {
     "dependencies": {
       "@org/core": "workspace:*"
     }
   }
   ```
3. Use pnpm Catalogs (`catalog:`) for third-party libraries shared across multiple subpackages.

### Phase 3: Deterministic Installation
1. In local feature development: run `pnpm install`.
2. In CI and verification environments: **always** mandate `pnpm install --frozen-lockfile`.
3. If peer dependency issues occur, resolve them via `pnpm.packageExtensions` rather than disabling strict checks.

### Phase 4: Filtered Subgraph Execution
Do not execute blanket monorepo builds when only one package changed. Use targeted graph filters:
- Build a single package and its dependencies:
  ```bash
  pnpm --filter @scope/web-app... run build
  ```
- Run tests only on packages changed relative to `main`:
  ```bash
  pnpm --filter "...[origin/main]" run test
  ```

### Phase 5: Integrity & Phantom Dependency Audit
Verify that no undeclared dependencies are imported in application code:
```bash
pnpm audit
```

---

## 2. Critical Anti-Patterns to Avoid
- ❌ Setting `shamefully-hoist=true` in `.npmrc` (destroys isolation and reintroduces phantom dependencies).
- ❌ Hardcoding published version numbers for local workspace packages (causes stale registry downloads).
- ❌ Running bare `pnpm install` in CI pipelines without `--frozen-lockfile`.
- ❌ Modifying `pnpm-lock.yaml` manually without running `pnpm install`.

## References & Documentation
- pnpm Architecture & Anti-Patterns: [references/pnpm-architecture-and-antipatterns.md](./references/pnpm-architecture-and-antipatterns.md)
- Monorepo Workspaces & Catalogs: [references/monorepo-workspaces-and-catalog.md](./references/monorepo-workspaces-and-catalog.md)
- Content-Addressable Storage & Isolation: [references/content-addressable-store-and-isolation.md](./references/content-addressable-store-and-isolation.md)

## Resources & Examples
- Standard pnpm Workspace Config: [resources/pnpm-workspace.yaml](./resources/pnpm-workspace.yaml)
- Enterprise .npmrc Configuration: [resources/.npmrc](./resources/.npmrc)
- pnpm Package Hooks Config: [resources/pnpmfile.cjs](./resources/pnpmfile.cjs)
- Monorepo Filter Commands: [examples/workspace_filter_commands.sh](./examples/workspace_filter_commands.sh)
- Workspace Protocol Linker: [examples/monorepo_package_linker.ts](./examples/monorepo_package_linker.ts)
- Lockfile Integrity Checker: [examples/pnpm_lockfile_integrity.ts](./examples/pnpm_lockfile_integrity.ts)
