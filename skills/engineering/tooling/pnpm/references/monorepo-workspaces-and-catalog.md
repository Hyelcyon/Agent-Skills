# pnpm Monorepo Workspaces and Catalogs Architecture

Architecture guidelines for managing enterprise monorepos, centralizing dependency version governance via pnpm Catalogs, and optimizing CI execution via workspace filtering.

## 1. Centralized Version Governance with pnpm Catalogs

In multi-package monorepos, version drift between packages (e.g. package A depending on `react@18.2` while package B uses `react@19.0`) creates severe runtime hazards, bundle duplication, and difficult debugging sessions.

pnpm 9 and 10 introduce Catalogs, allowing dependency versions to be declared centrally in `pnpm-workspace.yaml`.

### Defining Catalogs (`pnpm-workspace.yaml`)

```yaml
packages:
  - 'packages/*'
  - 'apps/*'

catalog:
  react: ^19.0.0
  react-dom: ^19.0.0
  typescript: ~5.8.0
  zod: ^3.24.0

catalogs:
  react18:
    react: ^18.3.1
    react-dom: ^18.3.1
```

### Consuming Catalogs in Subpackages (`packages/ui/package.json`)

```json
{
  "name": "@enterprise/ui",
  "version": "1.0.0",
  "dependencies": {
    "react": "catalog:",
    "react-dom": "catalog:",
    "zod": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```

Updating the version in `pnpm-workspace.yaml` immediately upgrades all consuming subpackages across the entire repository while keeping individual `package.json` diffs minimal.

---

## 2. Local Workspace Linking (`workspace:*`)

Internal package dependencies must always reference local sources during active development:

```json
{
  "name": "@enterprise/web-app",
  "dependencies": {
    "@enterprise/ui": "workspace:*",
    "@enterprise/logger": "workspace:^"
  }
}
```

When publishing to npm registry via `pnpm publish`, pnpm replaces `workspace:*` with the exact current semantic version automatically.

---

## 3. High-Performance Workspace Filtering

Never run builds sequentially across all packages when only a single component changes. Execute targeted commands using pnpm filters:

```bash
pnpm --filter @enterprise/web-app... build
pnpm --filter ...[origin/main] test
pnpm --filter @enterprise/core... --filter !@enterprise/legacy test
```

- **`--filter <pkg>...`**: Builds the target package and all of its dependencies.
- **`--filter ...[origin/main]`**: Selects only packages modified relative to `origin/main` and packages that depend on them.
- **`--filter !<pkg>`**: Excludes specific packages from execution.
