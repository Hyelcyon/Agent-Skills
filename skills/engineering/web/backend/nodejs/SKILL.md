---
name: nodejs
description: Use when building, refactoring, or optimizing Node.js backend services, configuring Node.js 22+ native TypeScript type stripping, utilizing built-in node:sqlite and node:test, or enforcing runtime security permissions (--permission).
---

# Enterprise Node.js Modern Runtime Architecture & Operational Runbook

Senior engineering standards for modern Node.js 22/23+ backend services: native ECMAScript Modules (ESM), zero-build native TypeScript type stripping (`--experimental-strip-types`), built-in SQLite (`node:sqlite`), native test runner (`node:test`), and the runtime Permission Model.

## When to Use
- Building or refactoring Node.js backend services on modern Node.js (v22+ LTS).
- Running TypeScript code directly in Node.js without build steps via native type stripping.
- Replacing external SQLite native C++ dependencies with built-in `node:sqlite`.
- Authoring unit and integration tests using `node:test` and `node:assert`.
- Hardening containerized microservices using the `--permission` sandboxing model.
- Managing graceful process lifecycle (`SIGTERM`, `SIGINT`) and Web Streams.

## When NOT to Use
- Building client-side browser user interfaces or React components (use `react` or `nextjs`).
- Writing raw browser DOM manipulation or pure client-side styling (use `ui-ux` or `html-css`).

---

## 1. Autonomous Agent Operational Protocol

When engineering Node.js services, the agent must execute these 5 sequential phases:

```
[Phase 1: Runtime Audit] ──> [Phase 2: Boundary Isolation] ──> [Phase 3: Native Primitives] ──> [Phase 4: Permission Enforce] ──> [Phase 5: Verification & Tests]
   Inspect Node engine >=22     Enforce ESM ("type": "module")   Use node:sqlite & node:test       Configure --permission flags      Run node --test & typecheck
```

### Phase 1: Runtime Engine Audit
1. Verify target environment meets Node.js $\ge 22.0.0$.
2. Enforce explicit package dependencies in `package.json` with `"type": "module"`.

### Phase 2: Boundary & Package Isolation
1. Define strict `"exports"` maps in `package.json` to shield private internal modules.
2. Use `node:` protocol prefix for all core standard library imports (`node:fs/promises`, `node:http`, `node:path`).

### Phase 3: Native Primitives Prioritization
1. Use native TypeScript execution via `--experimental-strip-types` for scripts and test harnesses.
2. Utilize `node:sqlite` (`DatabaseSync`) for local persistence and testing instead of heavy native addons.
3. Use `node:test` and `node:assert/strict` for automated test suites.

### Phase 4: Sandboxing & Permission Hardening
1. Whitelist filesystem access using `--allow-fs-read` and `--allow-fs-write`.
2. Disable child process spawning (`child_process`) unless explicitly authorized.

### Phase 5: Verification & Graceful Lifecycle
1. Ensure process intercepts `SIGTERM` and `SIGINT` to flush buffers and close connections before termination.
2. Verify test suites and coverage via `node --test --experimental-test-coverage`.

---

## 2. Critical Anti-Patterns to Avoid
- ❌ Using synchronous file operations (`readFileSync`, `writeFileSync`) in request handlers.
- ❌ Spreading user-controlled strings into shell execution (`child_process.exec`).
- ❌ Running Node.js processes as root without the Permission Model.
- ❌ Mixing CommonJS `require()` and ESM `import` in modern greenfield modules.

## References & Resources
- Runtime Engine & Native ESM: [references/nodejs-runtime-engine-and-esm.md](./references/nodejs-runtime-engine-and-esm.md)
- Native TypeScript & Type Stripping: [references/nodejs-native-typescript-and-type-stripping.md](./references/nodejs-native-typescript-and-type-stripping.md)
- Built-in SQLite Storage: [references/nodejs-builtin-sqlite-and-storage.md](./references/nodejs-builtin-sqlite-and-storage.md)
- Built-in Test Runner: [references/nodejs-builtin-test-runner.md](./references/nodejs-builtin-test-runner.md)
- Security & Permission Model: [references/nodejs-security-and-permission-model.md](./references/nodejs-security-and-permission-model.md)
- Streams, Networking & Lifecycle: [references/nodejs-streams-and-networking.md](./references/nodejs-streams-and-networking.md)
- Performance Profiling & Anti-Patterns: [references/nodejs-performance-and-antipatterns.md](./references/nodejs-performance-and-antipatterns.md)
- Production ESM Manifest: [resources/package-esm.json](./resources/package-esm.json)
- Runtime Permission Policy: [resources/node-permissions.json](./resources/node-permissions.json)
- Native Test Runner Config: [resources/node-test-config.json](./resources/node-test-config.json)
- HTTP & SQLite Service Example: [examples/http_sqlite_service.ts](./examples/http_sqlite_service.ts)
- Streaming Transformation Pipeline Example: [examples/streaming_pipeline.ts](./examples/streaming_pipeline.ts)
- Resilient Task Worker Example: [examples/resilient_task_worker.ts](./examples/resilient_task_worker.ts)
