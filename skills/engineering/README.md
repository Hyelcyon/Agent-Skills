# Engineering & Craftsmanship Skills

This directory provides specialized engineering runbooks, templates, and execution protocols across programming languages, web frontend, backend architecture, databases, security, cloud, and tooling for Google Antigravity.

## Skill Domains

### 1. Languages
- **[typescript](./languages/typescript/SKILL.md)**: Strict TypeScript 5.7+, isolatedDeclarations, satisfies operator, discriminated unions.
- **[javascript](./languages/javascript/SKILL.md)**: Modern ECMAScript (ES2024+), Temporal API, Promise.withResolvers, Set algebra.
- **[python](./languages/python/SKILL.md)**: Python 3.12/3.13+, Pydantic v2 schemas, asyncio TaskGroups, pattern matching.
- **[rust](./languages/rust/SKILL.md)**: Rust 2021/2024, type-state pattern, zero-copy borrowing, fearless concurrency.
- **[cpp](./languages/cpp/SKILL.md)**: Modern C++20/C++23, Concepts, Ranges pipelines, strict RAII.
- **[csharp](./languages/csharp/SKILL.md)**: C# 12/13, .NET 8/9 LTS, Span<T>, Channels, Native AOT.
- **[java](./languages/java/SKILL.md)**: Java 21/25 LTS, Loom Virtual Threads, StructuredTaskScope, record patterns.
- **[luau](./languages/luau/SKILL.md)**: Roblox Luau strict typing, prototype OOP, Janitor cleanup.
- **[html-css](./languages/html-css/SKILL.md)**: Semantic HTML5, CSS Container Queries, :has() selector, WCAG AA.
- **[asm](./languages/asm/SKILL.md)**: Extreme Assembly micro-optimization, SIMD/AVX-512/NEON, port saturation, lock-free atomics.
  - **[asm/arm64](./languages/asm/arm64/SKILL.md)**: ARM64/Apple Silicon assembly, NEON vectors, AAPCS64.
  - **[asm/x86-64](./languages/asm/x86-64/SKILL.md)**: x86-64 assembly, AVX-512, System V / Win64 ABI.

### 2. Web Frontend
- **[react](./web/frontend/react/SKILL.md)**: React 19+, React Compiler, Server Components, useActionState.
- **[nextjs](./web/frontend/nextjs/SKILL.md)**: Next.js 15+, App Router, Server Actions, PPR caching.
- **[vue](./web/frontend/vue/SKILL.md)**: Vue 3.5+, Composition API, Pinia, Vapor mode.
- **[svelte](./web/frontend/svelte/SKILL.md)**: Svelte 5, Runes ($state, $derived, $effect), Snippets.
- **[angular](./web/frontend/angular/SKILL.md)**: Angular 19+, Signals-first reactivity, @defer control flow, standalone.
- **[state-management](./web/frontend/state-management/SKILL.md)**: TanStack Query cache lifecycles, Zustand, optimistic UI mutations.
- **[ui-ux](./web/frontend/ui-ux/SKILL.md)**: View Transitions API, CSS subgrid, WCAG 2.2 AA accessibility.
- **[react-bits](./web/frontend/react-bits/SKILL.md)**: Animated UI components, 3D WebGL backgrounds, interactive cards.
- **[performance](./web/frontend/performance/SKILL.md)**: Core Web Vitals (LCP, INP, CLS), scheduler.yield, Speculation Rules.

### 3. Backend & Architecture
- **[nodejs](./web/backend/nodejs/SKILL.md)**: Node.js 22+, native TS type stripping, node:test, node:sqlite.
- **[api](./web/backend/api/SKILL.md)**: Cursor pagination, RFC 9457 Problem Details, Idempotency-Key.
- **[architecture](./web/backend/architecture/SKILL.md)**: Hexagonal Ports and Adapters, Transactional Outbox pattern.
- **[auth](./web/backend/auth/SKILL.md)**: OAuth 2.1 PKCE, BFF secure session cookie management, Argon2id.

### 4. Database
- **[schema-design](./database/schema-design/SKILL.md)**: Relational schema design, UUIDv7 vs BIGINT, 3NF, JSONB boundaries.
- **[migration](./database/migration/SKILL.md)**: Zero-downtime 3-phase Expand-Contract pattern, concurrent DDL.
- **[query-optimization](./database/query-optimization/SKILL.md)**: EXPLAIN ANALYZE execution plan audit, covering indexes.

### 5. Security & Cloud
- **[owasp-hardening](./security/owasp-hardening/SKILL.md)**: Neutralizing OWASP Top 10 and CWE Top 25 across Python, TS, and SQL.
- **[secret-management](./security/secret-management/SKILL.md)**: JIT credential fetching, HashiCorp Vault, preventing git leaks.
- **[ci-cd](./cloud/ci-cd/SKILL.md)**: GitHub Actions workflows, matrix builds, OIDC security hardening.
- **[docker](./cloud/docker/SKILL.md)**: Multi-stage Dockerfiles, BuildKit cache mounts, non-root user execution.

### 6. Tooling
- **[git](./tooling/git/SKILL.md)**: Atomic conventional commits, interactive rebase, worktrees, git bisect.
- **[github](./tooling/github/SKILL.md)**: SemVer governance, CODEOWNERS, GitHub CLI automation.
- **[ascii-diagram](./tooling/ascii-diagram/SKILL.md)**: Pixel-perfect terminal ASCII architecture charts and flowcharts.
- **[code-documentation](./tooling/code-documentation/SKILL.md)**: High-signal TSDoc/docstrings, removing redundant comments.
- **[ida](./tooling/ida/SKILL.md)**: Headless IDAPython automation, symbol disassembly, and binary recovery.
- **[npm](./tooling/npm/SKILL.md)** / **[pnpm](./tooling/pnpm/SKILL.md)** / **[vite](./tooling/vite/SKILL.md)**: Package and build pipeline configurations.
