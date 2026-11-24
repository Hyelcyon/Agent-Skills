# Enterprise pnpm Architecture & Anti-Patterns Runbook

A senior runbook covering pnpm's content-addressable store, symlink-based dependency isolation, monorepo workspace orchestration, and critical anti-patterns.

---

## 1. Content-Addressable Store & Symlink Topology

### The Phantom Dependency Problem (npm/yarn Flat Node Modules)
Flat `node_modules` hoist nested dependencies to the root `node_modules/` folder:
- If package `A` depends on `B`, and you only install `A`, your source code can still `import 'B'`.
- If package `A` updates and drops `B`, your code silently breaks in production.

### The pnpm Solution: Non-Flat Isolated Node Modules
pnpm stores all package files in a single global content-addressable store (`~/.local/share/pnpm/store`):
- Local `node_modules/` contains only symlinks to packages explicitly declared in `package.json`.
- Undeclared dependencies cannot be imported by application code, eliminating phantom dependencies entirely.

---

## 2. Critical Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Enabling `shamefully-hoist=true`
- **The Hazard**: Setting `shamefully-hoist=true` in `.npmrc` converts pnpm back into a flat npm-style `node_modules`, destroying dependency isolation and re-introducing phantom dependencies.
- **The Standard**: Keep `shamefully-hoist=false`. If a poorly written third-party package requires peer access, use `pnpm.packageExtensions` to declare the missing peer dependency explicitly.

### ❌ Anti-Pattern 2: Forgetting `--frozen-lockfile` in CI Pipelines
- **The Hazard**: Running bare `pnpm install` in CI allows pnpm to update `pnpm-lock.yaml` if dependencies drifted, leading to non-reproducible builds.
- **The Standard**: Always mandate `pnpm install --frozen-lockfile` in automated pipelines. The build must fail if `pnpm-lock.yaml` is out of sync with `package.json`.

### ❌ Anti-Pattern 3: Hardcoding Inter-Package Versions in Workspaces
- **The Hazard**: Specifying `"@monorepo/utils": "^1.2.0"` causes packages in a monorepo to pull stale published versions from the npm registry instead of local source directories.
- **The Standard**: Use the workspace protocol: `"@monorepo/utils": "workspace:*"`. pnpm automatically resolves local workspace packages and substitutes the real release version during publish.

---

## 3. Catalogs (pnpm 9 & 10 Feature)

Centrally manage shared dependency versions in `pnpm-workspace.yaml` instead of duplicating version strings across dozens of sub-packages:

```yaml
catalog:
  typescript: "^5.8.0"
  zod: "^3.24.0"
```

In any workspace subpackage:

```json
{
  "dependencies": {
    "zod": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```
