---
trigger: model_decision
description: "Apply when planning, implementing, refactoring, or executing any engineering task across programming languages, web frameworks, databases, security, cloud, or tooling to dispatch and leverage specialized Antigravity skills."
---

# Hybrid Rules & Skills Operational Dispatch Standard

This rule governs how the AI agent unifies high-level engineering invariants (Rules) with deep, domain-specific procedural execution runbooks (Skills).

---

## 1. The Core Hybrid Architecture Principle

- **Rules Define Invariants**: Rules specify what must always be true (security boundaries, error handling, strict typing, zero inline noise comments, verification evidence).
- **Skills Provide Execution Toolkits**: Skills provide on-demand, progressive disclosure runbooks, the 5-Phase Operational Protocol, production starter templates (`resources/`), verified implementations (`examples/`), and architectural deep-dives (`references/`).
- **Never Improvise from Memory**: When a task involves an installed skill domain, the agent must not invent ad-hoc configurations or unverified snippets. Load the skill manifest (`SKILL.md`) and deploy its established assets.

---

## 2. Dynamic Dispatch Routing Matrix

When the task scope matches any of the following categories, hydrate and follow the corresponding skill:

| Category | Domain Trigger | Primary Skill Path |
| :--- | :--- | :--- |
| **Languages** | TypeScript 5.7+, isolatedDeclarations | [`skills/engineering/languages/typescript`](../skills/engineering/languages/typescript/SKILL.md) |
| | Modern JavaScript, Temporal, Set algebra | [`skills/engineering/languages/javascript`](../skills/engineering/languages/javascript/SKILL.md) |
| | Java 21/25 LTS, Loom Virtual Threads | [`skills/engineering/languages/java`](../skills/engineering/languages/java/SKILL.md) |
| | C# 12/13, .NET 8/9 LTS, Span<T>, Channels, Native AOT | [`skills/engineering/languages/csharp`](../skills/engineering/languages/csharp/SKILL.md) |
| | Python 3.12+, Pydantic v2, TaskGroup | [`skills/engineering/languages/python`](../skills/engineering/languages/python/SKILL.md) |
| | Rust 2021/2024, Type-State, zero-copy | [`skills/engineering/languages/rust`](../skills/engineering/languages/rust/SKILL.md) |
| | Go 1.22/1.24+, errgroup, slog, leak-free | [`skills/engineering/languages/go`](../skills/engineering/languages/go/SKILL.md) |
| | C++20/C++23, Concepts, Ranges, RAII | [`skills/engineering/languages/cpp`](../skills/engineering/languages/cpp/SKILL.md) |
| | Luau, Roblox strict typing, Janitor | [`skills/engineering/languages/luau`](../skills/engineering/languages/luau/SKILL.md) |
| | Semantic HTML5, CSS Container Queries | [`skills/engineering/languages/html-css`](../skills/engineering/languages/html-css/SKILL.md) |
| | Extreme Assembly Optimization, SIMD/AVX-512/NEON, Port Saturation, Lock-Free | [`skills/engineering/languages/asm`](../skills/engineering/languages/asm/SKILL.md) |
| | x86-64 Assembly, NASM/GAS, AVX-512, System V / Win64 ABI | [`skills/engineering/languages/asm/x86-64`](../skills/engineering/languages/asm/x86-64/SKILL.md) |
| | ARM64 / AArch64 Assembly, NEON, Apple Silicon, AAPCS64 | [`skills/engineering/languages/asm/arm64`](../skills/engineering/languages/asm/arm64/SKILL.md) |
| **Frontend** | React 19+, Compiler, RSC, Actions | [`skills/engineering/web/frontend/react`](../skills/engineering/web/frontend/react/SKILL.md) |
| | Next.js 15+, App Router, Server Actions | [`skills/engineering/web/frontend/nextjs`](../skills/engineering/web/frontend/nextjs/SKILL.md) |
| | Vue 3.5+, Composition API, Pinia | [`skills/engineering/web/frontend/vue`](../skills/engineering/web/frontend/vue/SKILL.md) |
| | Svelte 5, Runes ($state, $derived) | [`skills/engineering/web/frontend/svelte`](../skills/engineering/web/frontend/svelte/SKILL.md) |
| | Angular 19+, Signals, Deferrable Views | [`skills/engineering/web/frontend/angular`](../skills/engineering/web/frontend/angular/SKILL.md) |
| | TanStack Query, Zustand, URL state | [`skills/engineering/web/frontend/state-management`](../skills/engineering/web/frontend/state-management/SKILL.md) |
| | Senior art direction, anti-slop typography, OKLCH craft, Taste Dials | [`skills/engineering/web/frontend/design-taste`](../skills/engineering/web/frontend/design-taste/SKILL.md) |
| | Core Web Vitals (LCP, INP, CLS) | [`skills/engineering/web/frontend/performance`](../skills/engineering/web/frontend/performance/SKILL.md) |
| | View Transitions, WCAG 2.2 AA | [`skills/engineering/web/frontend/ui-ux`](../skills/engineering/web/frontend/ui-ux/SKILL.md) |
| | React Bits animated UI, 3D backgrounds | [`skills/engineering/web/frontend/react-bits`](../skills/engineering/web/frontend/react-bits/SKILL.md) |
| **Backend & DB** | Node.js 22+, native type stripping | [`skills/engineering/web/backend/nodejs`](../skills/engineering/web/backend/nodejs/SKILL.md) |
| | Cursor pagination, RFC 9457, Idempotency | [`skills/engineering/web/backend/api`](../skills/engineering/web/backend/api/SKILL.md) |
| | High-performance RPC, Protocol Buffers proto3 | [`skills/engineering/web/backend/grpc`](../skills/engineering/web/backend/grpc/SKILL.md) |
| | Hexagonal Ports & Adapters, Outbox | [`skills/engineering/web/backend/architecture`](../skills/engineering/web/backend/architecture/SKILL.md) |
| | OAuth 2.1 PKCE, BFF cookie shielding | [`skills/engineering/web/backend/auth`](../skills/engineering/web/backend/auth/SKILL.md) |
| | In-memory caching, distributed locks, Lua atomicity | [`skills/engineering/database/redis`](../skills/engineering/database/redis/SKILL.md) |
| | Schema modeling, UUIDv7, normal forms | [`skills/engineering/database/schema-design`](../skills/engineering/database/schema-design/SKILL.md) |
| | Expand-Contract zero-downtime DDL | [`skills/engineering/database/migration`](../skills/engineering/database/migration/SKILL.md) |
| | EXPLAIN ANALYZE, Covering indexes | [`skills/engineering/database/query-optimization`](../skills/engineering/database/query-optimization/SKILL.md) |
| **Cloud & Ops** | Kubernetes orchestration, Restricted PSS, Probes, PDB | [`skills/engineering/cloud/kubernetes`](../skills/engineering/cloud/kubernetes/SKILL.md) |
| | Terraform / OpenTofu, remote state locking, moved blocks | [`skills/engineering/cloud/terraform`](../skills/engineering/cloud/terraform/SKILL.md) |
| | OpenTelemetry tracing, Prometheus RED/USE metrics, SLOs | [`skills/engineering/cloud/observability`](../skills/engineering/cloud/observability/SKILL.md) |
| | OWASP Top 10 / CWE Top 25 mitigations | [`skills/engineering/security/owasp-hardening`](../skills/engineering/security/owasp-hardening/SKILL.md) |
| | Vault dynamic secrets, Gitleaks scanning | [`skills/engineering/security/secret-management`](../skills/engineering/security/secret-management/SKILL.md) |
| | GitHub Actions CI/CD, OIDC, cosign | [`skills/engineering/cloud/ci-cd`](../skills/engineering/cloud/ci-cd/SKILL.md) |
| | Multi-stage Docker, distroless, non-root | [`skills/engineering/cloud/docker`](../skills/engineering/cloud/docker/SKILL.md) |
| | Conventional commits, worktrees, rebase | [`skills/engineering/tooling/git`](../skills/engineering/tooling/git/SKILL.md) |
| | SemVer guardrails, CODEOWNERS, PR body | [`skills/engineering/tooling/github`](../skills/engineering/tooling/github/SKILL.md) |
| | VS Code workspace, launch.json, tasks.json | [`skills/engineering/tooling/vscode`](../skills/engineering/tooling/vscode/SKILL.md) |
| | Package management with pnpm, npm, vite | [`skills/engineering/tooling/pnpm`](../skills/engineering/tooling/pnpm/SKILL.md), [`npm`](../skills/engineering/tooling/npm/SKILL.md), [`vite`](../skills/engineering/tooling/vite/SKILL.md) |
| | IDA Pro headless MCP analysis | [`skills/engineering/tooling/ida`](../skills/engineering/tooling/ida/SKILL.md) |
| | ASCII / Unicode diagrams, CJK visual width, box-drawing | [`skills/engineering/tooling/ascii-diagram`](../skills/engineering/tooling/ascii-diagram/SKILL.md) |
| **Platform & Systems** | Linux administration, systemd, cgroups v2, defensive Bash | [`skills/engineering/platform/linux`](../skills/engineering/platform/linux/SKILL.md) |
| | Windows administration, PowerShell 7.4+, SCM, ACLs, WSL2 | [`skills/engineering/platform/windows`](../skills/engineering/platform/windows/SKILL.md) |
| | macOS administration, launchd, arm64 codesign, Darwin userland | [`skills/engineering/platform/macos`](../skills/engineering/platform/macos/SKILL.md) |
| **Research & Learning** | Fast technical triage, multi-hop search & falsification | [`skills/research/light-research`](../skills/research/light-research/SKILL.md) |
| | Multi-vector spikes, gap-detection loops, Pugh matrix, ADR | [`skills/research/deep-research`](../skills/research/deep-research/SKILL.md) |
| | Workspace memory, user feedback /learn, post-mortems | [`skills/research/knowledge-learning`](../skills/research/knowledge-learning/SKILL.md) |
| **Skill Governance & Misc** | Antigravity App `skills.json`, schemas, manual skill audits | [`skills/misc/antigravity-skills-manager`](../skills/misc/antigravity-skills-manager/SKILL.md) |
| | Antigravity IDE/CLI, built-in customizations, plugins, hooks | Built-in `antigravity-guide`, `agy-customizations`, `plugin` |
| | Claude Code skill frontmatter, `context: fork`, plugins | [`skills/misc/claude-skills-manager`](../skills/misc/claude-skills-manager/SKILL.md) |
| | Codex CLI/App `.agents/skills/`, `agents/openai.yaml` | [`skills/misc/codex-skills-manager`](../skills/misc/codex-skills-manager/SKILL.md) |
| | Lazy Senior Developer minimal diffs, root-cause & YAGNI | [`skills/misc/senior`](../skills/misc/senior/SKILL.md) |
| | Ongoing maintenance, dependency upgrades, dead-code pruning | [`skills/misc/maintenance`](../skills/misc/maintenance/SKILL.md) |

---

## 3. The 5-Phase Hybrid Execution Lifecycle

Once dispatched to a skill, execute through the standard 5-phase protocol:

1. **Phase 1: Environment Profiling**: Inspect workspace root, manifests (`package.json`, `pom.xml`, `Cargo.toml`, `pyproject.toml`), and target engine versions. Hydrate matching invariants from `knowledge.json`.
2. **Phase 2: Safety & Context Shielding**: Apply strict type boundaries, allowlists, and sanitization before writing logic.
3. **Phase 3: Deterministic Surgical Execution**: Make the smallest coherent change matching the skill's idiomatic patterns.
4. **Phase 4: Evidence-Based Verification**: Execute automated linters, compilers, and tests (`tsc`, `ruff`, `cargo clippy`, `mvn test`).
5. **Phase 5: Transparent Completion Proof**: Report actual CLI terminal outputs, exit codes, and diff evidence.

---

## 4. Invariant Enforcement

- **Strict Zero Inline Comments**: Enforce [`rules/senior-developer-rules.md`](../rules/senior-developer-rules.md)—never inject redundant `//` or `/* */` comments explaining what code visibly does.
- **Mandatory English-Only Code & Comments**: Enforce [`rules/senior-developer-rules.md`](../rules/senior-developer-rules.md)—all code identifiers, types, inline comments, docstrings, and technical notes must be authored exclusively in English for readability and consistency.
- **Progressive Asset Loading**: Read sub-documents in `references/` or `examples/` only when that specific implementation branch is needed.

---

## 5. Agent Folder & File Creation Protocol

When generating, organizing, or refactoring codebase structures, enforce Big Tech architectural standards:

### Frontend Projects (`src/`)
- **Feature Colocation**: New domain capabilities belong in `src/features/<feature>/` (`components/`, `api/`, `hooks/`, `model/`, `index.ts`). Never dump business logic in flat `src/components/`.
- **Pure UI Primitives**: Only domain-agnostic atoms belong in `src/components/ui/`. UI primitives must NEVER import from `features/`.
- **Contract Reference**: Consult [`skills/engineering/web/frontend/react/references/production-frontend-architecture-and-folder-structure.md`](../skills/engineering/web/frontend/react/references/production-frontend-architecture-and-folder-structure.md).

### Backend / Server Projects (`backend/src/` or `server/src/`)
- **Modular Hexagonal**: Organize by business modules in `src/modules/<module>/` (`domain/`, `application/`, `infrastructure/`, `presentation/`, `index.ts`).
- **Inward Dependency Rule**: Domain core must NEVER import frameworks, ORMs, or controllers. Use Ports (`domain/ports/`) and Dependency Inversion.
- **Contract Reference**: Consult [`skills/engineering/web/backend/architecture/references/production-backend-architecture-and-folder-structure.md`](../skills/engineering/web/backend/architecture/references/production-backend-architecture-and-folder-structure.md).

---

## 6. Centralized Knowledge & Invariants Registry Protocol

To maintain workspace memory across agent turns without context window bloat:
- **Centralized Storage (`config/knowledge/`)**: All operational cards, environment quirks, and user corrections learned via `/learn` must be codified into `~/.gemini/config/knowledge/` (or `<workspace>/.gemini/knowledge/`) with a machine-readable entry in `knowledge.json` and a detailed Markdown card in `cards/`.
- **Knowledge Weight Hydration**: During Phase 1 (Environment Profiling), query `knowledge.json` for scope matches. Prioritize `critical` and `high` weight cards, drawing workspace-specific constraints into the execution context.
- **Rules & Skills Alignment**: Skills define *how* to execute; `knowledge.json` defines *workspace-specific weights and exceptions*. Never hardcode workspace-specific hacks directly into shared skills.

---

## 7. Level-1 Operational Safety & Verification Guard

The workstation integrates [`plugins/antigravity-cognitive-guard`](https://github.com/Hyelcyon/antigravity-cognitive-guard) as the Level-1 deterministic lifecycle interceptor:
- **PreToolUse Shielding**: Destructive filesystem operations (root wipe, system directory deletion, unverified force-pushes, credential dumps) are blocked synchronously before execution.
- **PostToolUse State Tracking**: Modified source and configuration files are tracked in real time, with immediate AST syntax checks on Python, JSON, and TOML.
- **Stop Verification Gate**: Premature completion without executing test/build verification commands on modified code is intercepted, enforcing Phase 5 quality proof. Pure documentation edits are automatically exempted.
