# Agent Skills

An engineering skills repository conforming to the [agentskills.io](https://agentskills.io) specification, providing procedural runbooks, strict type invariants, verified starter templates, and production implementations for autonomous coding agents (Claude Code, OpenAI Codex, Google Antigravity).

---

## 1. System Architecture & Standards

Skills in this repository operate under the **Progressive Disclosure** model to minimize context consumption:
1. **Discovery Phase**: Only skill names and triggers are injected into the agent system prompt (~50-100 tokens per skill).
2. **Activation Phase**: The root `SKILL.md` is loaded into context when domain triggers match.
3. **Deep Retrieval**: Reference documentation (`references/`) and templates (`resources/`) are read on-demand only when a specific implementation branch is required.

### Core Invariants Enforced Across All Skills
- **5-Phase Operational Protocol**: Environment Profiling → Safety & Context Shielding → Surgical Execution → Verification Gate → Transparent Proof.
- **Triad Quota Invariant**: Minimum 3 modular references, 3 working examples, and 3 production resources per skill (minimum 7 references for major frontend/runtime platforms).
- **Zero Inline Noise Comments**: Comments that restate obvious syntax are strictly prohibited. Code must be self-explanatory; comments are reserved for non-obvious invariants, race condition guards, and hardware/platform quirks.
- **Mandatory English-Only Standard**: All code identifiers, types, comments, docstrings, and commit messages are authored exclusively in technical English.

---

## 2. Installation Runbook

Skills are linked into agent configuration directories using filesystem junctions (Windows) or symbolic links (Unix/macOS). A subsequent `git pull` updates all installed skills in place without copying files.

### Windows (PowerShell)
```powershell
git clone https://github.com/Hyelcyon/Agent-Skills.git
cd Agent-Skills

# Install to all detected agents (Claude Code, Codex, Antigravity)
.\install.ps1 -All

# Or target specific agents
.\install.ps1 -Claude
.\install.ps1 -Codex
.\install.ps1 -Antigravity

# Inspect available skills
.\install.ps1 -List

# Remove symbolic links
.\install.ps1 -Uninstall -All
```

### macOS / Linux / WSL (Bash)
```bash
git clone https://github.com/Hyelcyon/Agent-Skills.git
cd Agent-Skills
chmod +x install.sh

# Install to all detected agents
./install.sh --all-agents

# Or target specific agents
./install.sh --claude
./install.sh --codex
./install.sh --antigravity

# Inspect available skills
./install.sh --list

# Remove symbolic links
./install.sh --uninstall
```

---

## 3. Platform Manifest Compatibility

This repository includes native manifest declarations for direct discovery across major agent ecosystems:

- **Anthropic Claude Code**: [`.claude-plugin/plugin.json`](./.claude-plugin/plugin.json) points to `./skills`.
- **OpenAI Codex**: [`.codex-plugin/plugin.json`](./.codex-plugin/plugin.json) points to `./skills`.
- **Google Antigravity**: [`plugin.json`](./plugin.json) and [`skills.json`](./skills.json) define categorized discovery paths.

---

## 4. Skills Taxonomy (50 Skills)

### Languages & Systems
| Skill | Target Runtime / Standard | Primary Invariants |
| :--- | :--- | :--- |
| **`go`** | Go 1.22 - 1.24+ | Uber goroutine lifecycle, Google Line-of-Sight error flow, `slog`, `errgroup` |
| **`python`** | Python 3.12 / 3.13+ | PEP 695 type parameter syntax, PEP 742 `TypeIs`, Pydantic v2 `ConfigDict(frozen=True)`, `asyncio.TaskGroup` |
| **`rust`** | Rust 2021 / 2024 Edition | Type-State pattern, zero-copy parsing (`Cow<'a, T>`), `thiserror` v2 domain errors |
| **`typescript`** | TypeScript 5.7 / 5.8+ | `isolatedDeclarations`, discriminated unions, `satisfies`, `as const` |
| **`javascript`** | ES2024 - ES2026+ | Temporal API, `Promise.withResolvers`, Set algebra, `Object.groupBy` |
| **`cpp`** | C++20 / C++23 | Concepts, Ranges pipelines, RAII ownership, move semantics |
| **`csharp`** | C# 12 / 13 (.NET 8 / 9) | Primary constructors, collection expressions `[...]`, `Span<T>`, Native AOT |
| **`java`** | Java 21 / 25 LTS | Loom virtual threads, `StructuredTaskScope`, scoped values, record patterns |
| **`asm`** | x86-64 & ARM64 | AVX-512 / NEON vector kernels, lock-free atomics, port saturation |
| **`luau`** | Roblox Luau | Strict type checking, metatable OOP, engine connection cleanup |
| **`html-css`** | Semantic HTML5 & CSS3 | CSS Container Queries, `:has()` relational selector, WCAG 2.2 AA accessibility |

### Platform & Operating Systems
| Skill | Target OS / Standard | Primary Invariants |
| :--- | :--- | :--- |
| **`linux`** | Linux / POSIX | Defensive Bash (`set -euo pipefail`), hardened `systemd` sandboxing, `cgroups` v2, USE method |
| **`windows`** | Windows 11 / Server | PowerShell 7.4+ (`[CmdletBinding()]`), Windows Services (`sc.exe`), NTFS ACLs, WSL2 bridge |
| **`macos`** | macOS Sonoma / Sequoia | Darwin BSD userland, `launchd` daemons (`bootstrap`/`bootout`), arm64 codesign, Brewfile |

### Web Frontend
| Skill | Framework Standard | Primary Invariants |
| :--- | :--- | :--- |
| **`react`** | React 19+ | React Server Components (RSC), Compiler memoization, `useActionState` |
| **`nextjs`** | Next.js 15+ | App Router, Partial Prerendering (PPR), async request APIs (`await params`) |
| **`vue`** | Vue 3.5+ | Composition API, reactive props destructuring, Pinia stores |
| **`svelte`** | Svelte 5 | Runes (`$state`, `$derived`, `$effect`), Snippets |
| **`angular`** | Angular 19+ | Standalone components, Signals-first reactivity, `@defer` control flow |
| **`state-management`** | TanStack Query v5 / Zustand | Server state separation, optimistic updates with rollback |
| **`performance`** | Core Web Vitals | LCP / INP / CLS metrics optimization, Speculation Rules API |
| **`ui-ux`** | Modern Web UX | View Transitions API, CSS scroll-driven animations, subgrid |
| **`react-bits`** | Creative UI Primitives | Interactive cards, micro-interactions, 3D WebGL background shaders |

### Web Backend & Database
| Skill | Subsystem | Primary Invariants |
| :--- | :--- | :--- |
| **`nodejs`** | Node.js 22+ | Native TypeScript type stripping, `node:sqlite`, `node:test` runner |
| **`api`** | REST / RPC | Keyset cursor pagination, RFC 9457 Problem Details, `Idempotency-Key` |
| **`architecture`** | Backend Systems | Hexagonal Ports and Adapters, Modular Monoliths, Transactional Outbox |
| **`auth`** | Identity & Sessions | OAuth 2.1 with PKCE, BFF cookie management, Argon2id hashing |
| **`schema-design`** | Relational Modeling | UUIDv7 primary keys, 3NF normalization, JSONB containment boundaries |
| **`migration`** | Zero-Downtime DDL | 3-phase Expand-Contract pattern, concurrent index creation |
| **`query-optimization`** | SQL Tuning | EXPLAIN ANALYZE interpretation, covering indexes, eliminating table scans |

### Security & DevOps
| Skill | Domain | Primary Invariants |
| :--- | :--- | :--- |
| **`owasp-hardening`** | Application Security | Neutralizing OWASP Top 10 and CWE Top 25 vulnerabilities |
| **`secret-management`** | Credential Lifecycle | HashiCorp Vault JIT tokens, zero-leak CI/CD, pre-commit Gitleaks |
| **`ci-cd`** | GitHub Actions | OIDC authentication, cosign supply chain attestation, cache mounts |
| **`docker`** | Containerization | Multi-stage BuildKit builds, non-root users, distroless images |

### Tooling & Research
| Skill | Subsystem | Primary Invariants |
| :--- | :--- | :--- |
| **`git`** | Version Control | Atomic conventional commits, interactive rebasing, bisecting |
| **`github`** | Repository Governance | SemVer guardrails, CODEOWNERS, ruleset branch protection |
| **`vscode`** | Editor Toolchain | Polyglot `settings.json`, `launch.json` debug pipelines, `tasks.json` problem matchers |
| **`npm` / `pnpm` / `vite`** | Package & Build Tooling | Catalogs, strict non-flat isolation, manual chunk splitting |
| **`senior`** | Craftsmanship | Minimal coherent diffs, zero trivial comments, root-cause fixes |
| **`deep-research`** | Architectural Spikes | Pugh decision matrices, Architecture Decision Records (ADR) |
| **`light-research`** | Fast Triage | Multi-hop search with falsification, version compatibility verification |
| **`knowledge-learning`** | Workspace Memory | Post-mortem distillation, invariant codification into knowledge hub |
| **`ida`** | Reverse Engineering | IDA Pro headless IDAPython automation and pseudocode decompilation |
| **`ascii-diagram`** | Terminal Documentation | Box-drawing flowcharts, sequence diagrams, CJK visual width alignment |
| **`code-documentation`** | Interface Documentation | Invariant documentation, removal of redundant what-comments |

---

## 5. Verification Gate

Run the automated verification suite to validate frontmatter schemas, Triad quotas, and relative link consistency:

```bash
python scripts/verify_all_skills.py
```
