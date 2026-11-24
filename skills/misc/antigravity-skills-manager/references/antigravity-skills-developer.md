# Antigravity Skills Developer Deep Dive

This reference guide provides an in-depth operational framework for architecting, authoring, and auditing production-grade skills specifically optimized for Google Antigravity.

---

## 1. Antigravity Skill Architecture & Directory Anatomy

Antigravity operates on the open Agent Skills specification (`agentskills.io`). Skills achieve high reasoning reliability and minimal token usage through **Progressive Disclosure** across five structural components:

```text
skill-name/
├── SKILL.md                  # [Required] Core entry runbook + YAML frontmatter (<500 words)
├── references/               # [Required for Complex Domains] Modular deep-dive documentation (>= 3 .md files)
├── scripts/                  # [Optional] Deterministic executable code (bash, ps1, python, node)
├── resources/                # [Optional] Raw assets, boilerplate templates, JSON schemas
└── examples/                 # [Optional] Real-world input/output pairs, baseline test cases
```

### 3-Phase Progressive Disclosure Lifecycle
```
  [1. Discovery Index]     Loads ONLY name + description into system prompt (~50-100 tokens).
            │
            ▼ (Triggered)
  [2. Activation Hydration]Loads SKILL.md body into working context when relevant.
            │
            ▼ (On-Demand)
  [3. Deep Retrieval]      Selectively reads references/ or executes scripts/ ONLY when needed.
```

---

## 2. Directory Anatomy Decision Matrix: When and How to Create Subdirectories

| Directory | When to Create | What Goes Inside | What NEVER Goes Inside |
| :--- | :--- | :--- | :--- |
| **`references/`** | Standard for all skills; mandatory for domain-heavy skills. | Modular Markdown docs breaking down specific architectural sub-domains. | Monolithic single files that dump entire frameworks into one unstructured page. |
| **`scripts/`** | When a task requires deterministic execution (parsing, linting, data transformations). | Python, Bash, PowerShell, or Node scripts that can be invoked via terminal. | Vague interactive scripts requiring manual user input loops. |
| **`resources/`** | When the agent needs static templates, configuration files, or raw assets to output. | Starter code boilerplates, `.gitignore` templates, JSON schemas, mock data. | Executable application code or core procedure documentation. |
| **`examples/`** | When prompt ambiguity causes formatting or reasoning deviations. | Verified Input/Output pairs, sample PR bodies, expected log outputs. | Complete production codebases or multi-language duplicates. |

---

## 3. The Modular Multi-Reference Law

### Why Monolithic / Sparse Documentation Fails AI Agents
When a complex domain is explained in a single `.md` file or in a brief summary, LLMs experience **Information Dilution and Hallucination**:
- The model conflates differing sub-domains (e.g. Server Components vs Client Actions, or build-time compilation vs runtime reactivity).
- Edge-case invariants (e.g. hydration mismatches, memory cleanup, compiler bailouts) are dropped due to lack of depth.
- The model cannot selectively load relevant documentation into working context without dragging along hundreds of irrelevant lines.

### Quantitative Reference, Example, and Resource Quotas

1. **The Modular Multi-Reference Law**:
   - **General Skills (Minimum 3 `.md` Files)**:
     Any standard domain skill (e.g. database migration, git operations, API design, performance) must partition its architectural reference into **at least 3 focused `.md` documents** (e.g. core runbook, anti-patterns & failure recovery, edge-case deep dive).
   - **Major Runtime, Platform & Framework Skills (Minimum 7 `.md` Files)**:
     Complex full-stack or frontend frameworks and runtimes (including **React**, **Vue**, **Angular**, **Svelte**, **Node.js**, **Next.js**) must partition their documentation into **at least 7 dedicated `.md` reference files**.
     These 7 documents must independently cover:
     1. Compiler, Runtime Engine & Core Execution Model
     2. Server-First / SSR Hydration & Serialization Boundaries
     3. State Architecture, Caching & Data Fetching
     4. Mutation, Actions & Request Lifecycle
     5. Component / Module Composition & Primitive APIs
     6. Routing, Asset Optimization & Static/Dynamic Boundaries
     7. Performance Profiling, Memory Leaks & Anti-Patterns

2. **The Working Example Triad Quota (Minimum 3 Working Examples)**:
   - A single example causes the AI model to overfit to that one specific scenario (e.g. only testing a counter, or only handling a simple GET request).
   - Every skill MUST provide **at least 3 distinct, verified examples** in `examples/`:
     1. *Baseline/Idiomatic Pattern*: Clean, minimal reference implementation of standard workflow.
     2. *Advanced/Async/Streaming Pattern*: Robust implementation handling concurrency, streaming, or complex composition.
     3. *Resilient Error-Handling/Rollback Pattern*: Fault-tolerant implementation demonstrating validation, rollback, or recovery.

3. **The Reusable Resource Triad Quota (Minimum 3 Resources)**:
   - Every skill MUST provide **at least 3 production-grade starter templates, manifests, or schemas** in `resources/` (e.g. strict compiler configs, linter/CI rules, schema definitions, baseline template files).
   - This eliminates configuration hallucinations and ensures deterministic bootstrapping.

---

## 4. Subdirectory Authoring Guidelines

### A. Authoring `references/` (Context-Saving Deep Dives)
- **Goal**: Keep `SKILL.md` lean. The agent must read `references/` **only** if it hits that specific branch.
- **Rule**: Always link to reference files using standard relative Markdown links from `SKILL.md`:
  ```markdown
  ## Specialized Architecture References
  - React Compiler Deep Dive: [references/react-compiler-and-memoization.md](./references/react-compiler-and-memoization.md)
  - Server Components Protocol: [references/react-server-components-rsc.md](./references/react-server-components-rsc.md)
  ```
- **Constraint**: Do NOT force-load reference files with `@` symbols or pre-read commands. Let the agent's progressive navigation handle retrieval.

### B. Authoring `scripts/` (Deterministic Offloading)
- **Goal**: Shift complex regex parsing, AST analysis, or API querying away from the LLM's context window into executable code.
- **Rule**: The agent executes the script; **only the stdout/stderr enters the context window**, saving hundreds of tokens:
  ```bash
  node scripts/check-deps.js
  python scripts/audit_tokens.py
  ```
- **Constraint**: Scripts must be idempotent and safe to run in dry-run/preview modes.

### C. Authoring `resources/` (Reusable Assets & Templates)
- **Goal**: Provide standard templates that the agent can read and adapt into the target workspace.
- **Examples**:
  - `resources/pr-template.md`: A standard PR template to copy into `.github/`.
  - `resources/schema.json`: JSON Schema to validate data payloads.

### D. Authoring `examples/` (Few-Shot Precision)
- **Goal**: Ground the agent's behavior with concrete examples. "One excellent example beats ten mediocre ones."
- **Rule**: Provide complete, runnable, and realistic examples explaining **why** specific patterns were chosen.

---

## 5. Skill Discovery Optimization (SDO)

The YAML frontmatter `description` is the **only surface** the agent has to determine relevance. Follow these strict authoring rules:

### A. The "When to Use" Law
- **State ONLY when to use, NEVER summarize the workflow.**
  - ❌ *Harmful:* `description: "Runs npm test, checks output for errors, and fixes flaky tests."`
    - **Consequence:** The agent will attempt to execute this three-step summary directly without reading `SKILL.md`, bypassing your edge-case handlers and verification gates.
  - ✅ *Optimal:* `description: "Use when diagnosing flaky tests, timeout failures, or non-deterministic test suites."`

### B. Trigger and Symptom Inclusion
- Include exact error messages, CLI flags, technical nouns, and file patterns:
  - Examples: `ENOTEMPTY`, `401 Unauthorized`, `git rebase --onto`, `tsconfig.json`.

---

## 6. The Autonomous Agent Operational Standard

A skill must not merely list prohibitions and anti-patterns; it must give the AI agent an actionable, proactive 5-phase execution playbook:

```
[Phase 1: Environment Profiling]
  Inspect workspace root, manifests, lockfiles, and compiler settings before taking action.
        │
        ▼
[Phase 2: Safety & Context Shielding]
  Establish protective boundaries (.dockerignore, .gitignore, "files" whitelist) to prevent unintended side-effects.
        │
        ▼
[Phase 3: Deterministic Surgical Execution]
  Apply the minimum coherent change using established project idioms without touching unrelated files.
        │
        ▼
[Phase 4: Evidence-Based Verification]
  Run verification commands (builds, dry-runs, tests, linters) and inspect real CLI output.
        │
        ▼
[Phase 5: Transparent Completion Proof]
  Provide concrete verification evidence (logs, diffs, exit codes) instead of generic claims of success.
```

---

## 7. Authoring Checklist (TDD for Skills)

Before committing or deploying any skill, verify against this quality gate:

- [ ] **Frontmatter Integrity**: Starts at line 1, valid YAML, contains lowercase kebab-case `name` and trigger-based `description`.
- [ ] **Modular Reference Quota**: Minimum 3 `.md` reference files for general skills; minimum 7 `.md` reference files for major libraries/frameworks/runtimes (React, Vue, Angular, Svelte, Node.js, Next.js).
- [ ] **Example Triad Quota**: Minimum 3 working, verified code examples in `examples/` (baseline, advanced/async, and resilient error handling).
- [ ] **Resource Triad Quota**: Minimum 3 reusable configuration templates, manifests, or schemas in `resources/`.
- [ ] **Zero Inline Comments**: Strictly zero inline comments in implementation examples, scripts, and configurations.
- [ ] **Operational Protocol**: Contains a clear 5-phase execution workflow guiding agent behavior.
- [ ] **Body Conciseness**: `SKILL.md` body is concise (<500 words or ~300 lines).
- [ ] **Reference Isolation**: Bulky specs (>100 lines) moved to `references/` and hyperlinked.
- [ ] **Deterministic Offloading**: Complex calculations or multi-step queries converted into executable scripts in `scripts/`.
- [ ] **Discovery Registered**: Path verified either in the 1-level root or in `skills.json`.
