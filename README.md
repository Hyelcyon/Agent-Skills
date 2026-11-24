# Agent Skills

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Verification: 100% Pass](https://img.shields.io/badge/Verification-100%25%20Pass-brightgreen.svg)]()
[![Compatible: Antigravity | Claude Code | Codex](https://img.shields.io/badge/Compatibility-Antigravity%20%7C%20Claude%20%7C%20Codex-orange.svg)]()

A curated, battle-tested library of **46 production-grade engineering, language, and architecture skills** built on the open [agentskills.io](https://agentskills.io) standard for autonomous coding agents (Claude Code, OpenAI Codex, Google Antigravity).

Every skill is grounded in industry gold standards (Google Go Style Guide, Uber Go Guide, Modern Rust 2024, Python 3.12+ PEP 695/742, React 19, OWASP Top 10) with verified working examples, production starter templates, and modular deep-dive documentation.

---

## ⚡ Quick Start: 1-Click Installation

Clone and install all 46 skills into your favorite AI coding agents in seconds. Skills are linked via zero-copy junctions or symlinks, so a single `git pull` updates your entire skill ecosystem in place.

### Windows (PowerShell)
```powershell
git clone https://github.com/Hyelcyon/Agent-Skills.git
cd Agent-Skills
.\install.ps1 -All
```

### macOS / Linux / WSL (Bash)
```bash
git clone https://github.com/Hyelcyon/Agent-Skills.git
cd Agent-Skills
chmod +x install.sh
./install.sh --all-agents
```

---

## 🤖 Supported Agent Platforms

| Platform | Discovery Method | Manifest / Target |
| :--- | :--- | :--- |
| **Google Antigravity** | Native `skills.json` / Plugin API | `plugin.json` or `~/.gemini/config/skills` |
| **Anthropic Claude Code** | `.claude-plugin` / Skill directory | `.claude-plugin/plugin.json` or `~/.claude/skills` |
| **OpenAI Codex** | `.codex-plugin` / Skill directory | `.codex-plugin/plugin.json` or `~/.codex/skills` |
| **Cursor & Generic CLI** | Open Agent Skills (`SKILL.md`) | `~/.cursor/skills` or direct workspace embedding |

---

## 📦 Targeted Agent Installation

Install only for specific agents:

```bash
# Claude Code only:
./install.sh --claude         # Linux/macOS
.\install.ps1 -Claude         # Windows

# OpenAI Codex only:
./install.sh --codex          # Linux/macOS
.\install.ps1 -Codex          # Windows

# Google Antigravity only:
./install.sh --antigravity    # Linux/macOS
.\install.ps1 -Antigravity    # Windows

# List all available skills:
./install.sh --list
.\install.ps1 -List

# Clean uninstallation (removes links only):
./install.sh --uninstall
.\install.ps1 -Uninstall -All
```

---

## 📚 46 Skills Catalog

### 1. Languages & Systems
* **`go`**: Modern Go 1.22 - 1.24+ senior engineering. Goroutine lifetime management (Uber Standard), Google Line-of-Sight error flow, `log/slog` structured observability, functional options, and `errgroup`.
* **`python`**: Python 3.12/3.13+ strict typing (PEP 695 generics, PEP 742 `TypeIs`), Pydantic v2 validation core, and structured `asyncio.TaskGroup`.
* **`rust`**: Modern Rust 2021/2024 edition. Type-state state machines, zero-copy parsing (`Cow`), and memory safety bounds.
* **`typescript`**: TS 5.7/5.8+ with `isolatedDeclarations`, discriminated unions, and `satisfies` invariants.
* **`javascript`**: Modern ECMAScript (ES2024 - ES2026+), Temporal API, `Promise.withResolvers`, and Set algebra.
* **`cpp`**: Modern C++20/C++23 with Concepts, Ranges pipelines, and strict RAII ownership.
* **`csharp`**: C# 12/13, .NET 8/9 LTS, `Span<T>`, Channels, Native AOT, and primary constructors.
* **`java`**: Java 21/25 LTS, Loom virtual threads, `StructuredTaskScope`, and scoped values.
* **`asm`** (`arm64`, `x86-64`): Micro-optimized assembly, AVX-512/NEON vector kernels, and lock-free atomic barriers.
* **`luau`**: Roblox engine type-checking, metatable optimization, and memory leak prevention.
* **`html-css`**: Semantic HTML5, CSS Container Queries, `:has()` relational selector, and WCAG accessibility.

### 2. Web Frontend
* **`react`**: React 19 Server Components (RSC), Actions, Compiler, and `useActionState`.
* **`nextjs`**: Next.js 15+ App Router, Partial Prerendering (PPR), and Server Actions.
* **`vue`**: Vue 3.5+ Composition API, reactive props destructuring, and Pinia stores.
* **`svelte`**: Svelte 5 Runes (`$state`, `$derived`, `$effect`) and Snippets composition.
* **`angular`**: Angular 19 standalone components, Signals-first reactivity, and zoneless detection.
* **`state-management`**: TanStack Query server state lifecycles and client cache architectures.
* **`performance`**: Core Web Vitals (LCP, INP, CLS) optimization and Speculation Rules.
* **`ui-ux`**: View Transitions API, CSS scroll-driven animations, and design tokens.
* **`react-bits`**: Production-ready micro-interactions, text effects, and 3D WebGL backgrounds.

### 3. Backend & Database
* **`nodejs`**: Node.js 22+ native TypeScript type-stripping, `node:sqlite`, and test runner.
* **`api`**: Modern RESTful/RPC APIs, cursor pagination, RFC 9457 errors, and Idempotency-Key.
* **`architecture`**: Hexagonal Ports and Adapters, Modular Monoliths, and Transactional Outbox.
* **`auth`**: OAuth 2.1 with PKCE, Backend-for-Frontend (BFF) session shielding, and Argon2id.
* **`schema-design`**: Relational database modeling, UUIDv7 primary keys, and 3NF normalization.
* **`migration`**: Zero-downtime 3-phase Expand-Contract schema migrations and concurrent DDL.
* **`query-optimization`**: SQL EXPLAIN ANALYZE interpretation and B-Tree/GIN covering indexes.

### 4. Security & Cloud
* **`owasp-hardening`**: Neutralizing OWASP Top 10 and CWE Top 25 vulnerabilities across stacks.
* **`secret-management`**: HashiCorp Vault dynamic credentials, zero-leak CI/CD, and Gitleaks.
* **`ci-cd`**: GitHub Actions workflows, OIDC authentication, and cosign image attestation.
* **`docker`**: Multi-stage BuildKit Dockerfiles, non-root execution, and distroless containers.

### 5. Tooling & Governance
* **`git`**: Atomic conventional commits, interactive rebases, worktrees, and regression bisecting.
* **`github`**: SemVer guardrails, PR templates, CODEOWNERS, and ruleset governance.
* **`npm`**, **`pnpm`**, **`vite`**: Monorepo workspace configuration, catalog dependency management, and build pipelines.
* **`senior`**: Senior craftsmanship operational standard: minimal coherent diffs, zero trivial comments, root-cause fixes.
* **`deep-research`**, **`light-research`**, **`knowledge-learning`**: Multi-hop triage, falsification searches, and persistent ADR distillation.
* **`ida`**: Reverse engineering binaries via IDA Pro headless analysis.
* **`ascii-diagram`**, **`code-documentation`**: Box-drawing architecture diagrams and TSDoc/JSDoc authoring.

---

## 🛡️ Quality Invariants

Every skill in this repository is verified against:
1. **Triad Quotas**: Minimum 3 modular references, 3 production examples, and 3 starter resources per skill (7 references for major frameworks).
2. **Zero Inline Comments Rule**: Code is self-documenting; comments strictly document "why", invariants, and non-obvious constraints.
3. **Mandatory English-Only Standard**: All identifiers, documentation, and error strings are strictly in English.
4. **Automated Verification**: Run `python scripts/verify_all_skills.py` anytime to ensure 100% link integrity and syntax validity.

---

## 📄 License
MIT License. Free to use, adapt, and distribute across all personal and commercial agent workflows.
