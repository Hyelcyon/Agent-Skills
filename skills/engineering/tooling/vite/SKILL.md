---
name: vite
description: Use when configuring Vite build pipelines, setting up manual chunk splitting, typing import.meta.env, authoring custom Vite plugins, or preventing VITE_ secret leak hazards.
---

# Enterprise Vite Architecture & Agent Operational Runbook

Standard operational protocol for autonomous agents configuring Vite 6 build pipelines, manual chunk splitting, environment variable typing, tree-shaking optimization, and production bundling.

## When to Use
- Configuring `vite.config.ts` for modern React, Vue, or Svelte client applications.
- Establishing vendor chunk splitting rules via `rollupOptions.output.manualChunks`.
- Strongly typing environment variables through `ImportMetaEnv` and `envPrefix`.
- Authoring custom Vite plugins for HTML transformations or asset handling.
- Diagnosing tree-shaking and barrel file performance degradation.

## When NOT to Use
- Running production web servers directly via `vite dev` or `vite preview` (use `docker`).
- Managing monorepo workspace dependencies or package publishing (use `pnpm` or `npm`).

---

## 1. Autonomous Agent Operational Protocol

When assigned to configure, optimize, or troubleshoot a Vite build, the agent must execute these 5 sequential phases:

```
[Phase 1: Config & Environment] ──> [Phase 2: Secret Audit] ──> [Phase 3: Chunk Splitting] ──> [Phase 4: Build Execution] ──> [Phase 5: Output Verification]
     Inspect vite.config.ts             Audit VITE_ variables         Configure manualChunks           Run vite build                Inspect dist/ assets
```

### Phase 1: Configuration & Environment Typing
1. Inspect `vite.config.ts` and `tsconfig.json`.
2. Ensure path aliases (e.g. `@/`) defined in `vite.config.ts` match `compilerOptions.paths` in `tsconfig.json`.
3. Provide explicit TypeScript declarations for environment variables in `vite-env.d.ts`.

### Phase 2: Environment Secret Audit
Before compiling or setting environment variables:
1. Grep the codebase for `import.meta.env.VITE_`.
2. Verify that **no private secrets** (database credentials, private API keys, payment secret keys) carry the `VITE_` prefix.
3. If private secrets are found, move them to server-side endpoints or backend environment variables.

### Phase 3: Manual Chunk Splitting
Configure `build.rollupOptions.output.manualChunks` carefully to balance caching and initialization order:
- Isolate framework libraries (`react`, `react-dom`, `@tanstack/react-query`) into dedicated vendor chunks (`vendor-react`, `vendor-query`), watching closely for circular dependency TDZ crashes (`Cannot access 'X' before initialization`) between manually split chunks.
- Keep rapidly mutating business logic in application chunks to maximize browser caching efficiency.

### Phase 4: Production Build & Asset Verification
Execute the production build and inspect `dist/` assets and chunk warnings:
```bash
npx vite build
```
Verify that:
- Chunk sizes remain within configured limits (warning limit: 600kB).
- Source maps (`.map`) are generated if configured, or omitted for public production deployments.
- CSS is properly code-split and minified.

### Phase 5: Local Production Verification (Non-Blocking)
Never run `npx vite preview` as a blocking synchronous command inside an agent shell (the process stays alive indefinitely until killed). Start `vite preview --port 4173` as an explicit daemon/background process when runtime smoke verification is needed, verify asset HTTP responses, and terminate cleanly afterwards.

---

## 2. Critical Anti-Patterns to Avoid
- ❌ Running `vite dev` or `vite preview` synchronously inside automated verification shells or inside production containers.
- ❌ Prefixing sensitive backend credentials with `VITE_` (statically bakes secrets into client bundles).
- ❌ Leaving default Rollup chunking on complex applications (creates bloated multi-megabyte bundles).
- ❌ Importing through large barrel files (`import { X } from '@/components'`) without tree-shaking verification.

## References & Documentation
- Vite Architecture & Anti-Patterns: [references/vite-performance-and-antipatterns.md](./references/vite-performance-and-antipatterns.md)
- Plugin Architecture & Rollup Hooks: [references/plugin-architecture-and-roll-up.md](./references/plugin-architecture-and-roll-up.md)
- SSR & Environment API Architecture: [references/ssr-and-environment-api.md](./references/ssr-and-environment-api.md)

## Resources & Examples
- Production vite.config.ts: [resources/vite.config.ts](./resources/vite.config.ts)
- Vite Environment Types: [resources/vite-env.d.ts](./resources/vite-env.d.ts)
- Vite Node TSConfig: [resources/tsconfig.node.json](./resources/tsconfig.node.json)
- Custom Vite Plugin Example: [examples/custom_vite_html_plugin.ts](./examples/custom_vite_html_plugin.ts)
- Rollup Vendor Chunk Splitter: [examples/rollup_manual_chunks.ts](./examples/rollup_manual_chunks.ts)
- Vite Env Validation Schema: [examples/env_variable_schema.ts](./examples/env_variable_schema.ts)
