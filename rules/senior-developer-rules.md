---
trigger: model_decision
description: "Apply when writing, modifying, refactoring, reviewing, or documenting source code across any language, establishing software craftsmanship standards, eliminating trivial comments, enforcing English-only code, rendering ASCII diagrams, or evaluating code quality and architectural trade-offs."
---

# Senior Developer Engineering Standards (Craftsmanship, Code Quality & Review)

This rule establishes workstation-wide senior engineering standards governing code craftsmanship, comment quality, architectural review, documentation, and technical diagrams across all programming languages.

---

## 1. Core Principles of Senior Craftsmanship & Cognitive Rigor

- **The Best Code is the Code Never Written**:
  - Always implement the smallest coherent change that fully solves the problem.
  - Reject premature abstractions, speculative configurability, unused helper wrappers, and "for later" features nobody asked for.
  - Prefer existing codebase primitives, internal helpers, and platform standard library features before adding external dependencies.
- **Root-Cause Engineering over Patch Layering**:
  - Never apply superficial patches or wrapper shims over uninvestigated symptoms.
  - Trace callers, data flows, and state transitions to address defects at their architectural source.
- **REPL-First Empirical Verification (Never Eyeball Code)**:
  - Never present code or regex patterns from raw generative memory without execution proof.
  - Always execute candidate code in a minimal scratch test (`node -e "..."`, `python -c "..."`, `tsc --noEmit`) to confirm types, signatures, and runtime behavior before integrating.
- **Test-Time Compute Scaling & Hypothesis Branching (Reject Greedy Decoding)**:
  - Avoid linear trial-and-error patching. When facing non-trivial defects or ambiguous failures, formulate 2-3 mutually exclusive root-cause hypotheses.
  - Design targeted empirical probes (scratch scripts, isolated unit tests, or log inspections) to falsify incorrect hypotheses before modifying shared application logic.
  - Isolate high-risk experiments using scratch branches or worktrees (`workspace: "branch"`).
- **Decoupled Adversarial Critic (Overcoming the Verification Bottleneck)**:
  - Separate code *generation* from code *verification*. After drafting a solution, evaluate the proposed diff through the eyes of an adversarial external auditor:
    - *"What boundary edge cases (null, undefined, 0, negative, empty collections, unicode surrogate pairs, concurrent calls) break this?"*
    - *"Did I assume a happy path that hangs on network timeout, socket disconnect, or disk exhaustion?"*
    - *"Does this introduce contract drift or violate caller assumptions?"*
- **Rollback Discipline (Zero Patch Layering)**:
  - If a modification fails to compile, breaks existing tests, or introduces unintended side effects, immediately roll back to the clean baseline. Never layer speculative secondary patches on top of a compromised diff.
- **High-Signal / Low-Noise Invariant**:
  - Code must be self-explanatory through precise naming, small focused functions, strict types, and clean control flow.
  - A short, obvious diff is vastly superior to an elaborate refactoring that obscures the core fix.

---

## 2. Senior Code Commenting Standards

### The Core Invariant: Document "Why", Not "What"
- **Prohibit Redundant What-Comments**: Never write comments that merely restate what the code visibly executes in plain syntax.
  - ❌ *Junior noise:* `// set user age to 18` above `user.age = 18;`
  - ❌ *Junior noise:* `// loop over users` above `for user in users:`
  - ❌ *Junior noise:* `// return true if active` above `return self.is_active`
- **Code Speaks for Itself**: If an expression or block is unclear, first refactor variable names, extract well-named helper functions, or simplify the algorithm.
- **Explain Rationale & Trade-Offs**: Use comments to explain **why** a specific, non-obvious approach was chosen over obvious alternatives:
  ```typescript
  // Pre-allocating buffer capacity to prevent GC pressure during high-throughput ingestion
  const buffer = new Uint8Array(ESTIMATED_MAX_PAYLOAD);
  ```

### 2.1 AI Slop in Code Comments: Archetypes & Senior Contrast

Generative models habitually inject five distinct archetypes of predictive filler comments ("AI Slop"). Every agent must recognize and systematically eliminate these patterns:

| Archetype | AI Slop Pattern (❌ Prohibited) | Senior Engineering Standard (✅ Required) |
| :--- | :--- | :--- |
| **1. The Echo Parrot<br>(코드 앵무새)** | Repeating code syntax in natural language:<br>`// Parse JSON data`<br>`const data = JSON.parse(raw);`<br>`// Check if user is null`<br>`if (!user) return;` | Delete the comment entirely. Code is self-documenting.<br>```typescript<br>const data = JSON.parse(raw);<br>if (!user) return;<br>``` |
| **2. The Category Billboard<br>(카테고리 현수막)** | Adding arbitrary separator banners:<br>`// =====================`<br>`// HELPER FUNCTIONS`<br>`// =====================`<br>`// Constants`<br>`const PORT = 3000;` | Delete banners. Code organization, small files, and module exports communicate structure without visual noise. |
| **3. The Changelog Tombstone<br>(작업 유물 기록)** | Embedding session/AI provenance or commit history:<br>`// Added by AI to fix issue #102`<br>`// Updated logic here`<br>`// Previous version had a bug with null` | Omit provenance. Git history (`git blame`, conventional commits) tracks change history. Comments describe timeless system invariants. |
| **4. The Trivial Param Echo<br>(매개변수 단순 복사)** | Mechanical docstrings restating names:<br>`/**`<br>` * @param userId - The user ID.`<br>` * @returns The user.`<br>` */` | Document semantics, formats, invariants, and failure modes:<br>`/**`<br>` * @param userId - Canonical UUIDv7 string. Must match tenant namespace.`<br>` * @returns Fully hydrated user entity, or null if deleted.`<br>` * @throws {TenantMismatchError} If user belongs to a foreign partition.`<br>` */` |
| **5. The Speculative Hand-Waving<br>(막연한 유보와 방치)** | Deferring responsibility or guessing intent:<br>`// Handle errors if needed`<br>`// TODO: Optimize this later`<br>`// Might be null sometimes, be careful` | Handle the error deterministically, enforce types, or document the exact non-obvious invariant that proves why null is impossible. |

### 2.2 The 4 Cardinal Invariants of Senior Comments (Ousterhout & Google Standards)
Document only what the code **cannot** say on its own:
1. **The "Why" & Rejected Alternatives**: Why this specific approach was selected instead of the obvious/naive solution (e.g. why bitmask instead of string array, why custom allocator, why `SKIP LOCKED`).
2. **Platform & Vendor Quirks**: Upstream API bugs, browser-specific rendering quirks, or OS-level file locking semantics, complete with tracking issue URLs or CVE references.
3. **Concurrency & Synchronization Ordering**: Strict lock acquisition hierarchies, atomic memory ordering invariants (`Acquire-Release`), or distributed consensus constraints.
4. **Hardware & Memory Architecture**: Cache line alignment padding (`#[repr(align(64))]`), branch predictor hints, or GC pause bounds.

### Invariants, Quirks & Hidden Assumptions
Document when the implementation relies on hidden assumptions or external quirks that cannot be deduced from syntax alone:
1. **Third-Party & Platform Quirks**: Upstream API bugs, browser-specific layout bugs, or OS discrepancies.
2. **Concurrency & Locking Ordering**: Lock acquisition hierarchies, atomicity requirements, race-condition guards.
3. **Performance Bounds**: Why an unusual algorithm or memory layout is chosen to maintain $O(1)$ lookup or avoid GC pauses.
4. **Security & Trust Boundaries**: Cryptographic invariants, why an input cannot be null, or why a regex avoids catastrophic backtracking.

### Formal Interface & Boundary Documentation
Every exported function, public class, interface, and shared utility must have formal documentation at its boundary:
- **TypeScript / JavaScript**: Formal **TSDoc** / **JSDoc** comments (`/** ... */`) specifying `@param`, `@returns`, and `@throws`.
- **Python**: Formal **Google-Style** or **Sphinx** docstrings (`""" ... """`) specifying `Args:`, `Returns:`, and `Raises:`.
- **Rust**: Outer doc comments (`///`) with `# Arguments`, `# Returns`, `# Errors`, and `# Panics` sections.
- **Preconditions & Postconditions**: Document what the caller must guarantee and what state is guaranteed upon return.
- **Side Effects**: Document mutations to global state, network I/O, or disk operations.

### Maintenance & Dead Code Prohibition
- **Update or Delete**: When modifying existing code, immediately update or delete adjacent comments that no longer match the implementation. Stale comments are worse than no comments.
- **Never Leave Dead Code**: Never commit commented-out code blocks (`// oldCode();`). Git history preserves previous versions.

---

## 3. Mandatory English-Only Standard

To maintain clean typography, seamless tool/linter parsing, and global collaboration standards:
- **All Source Code in English**: All identifiers (variables, functions, classes, interfaces, types, parameters, enum members) must be named exclusively in standard English.
- **All Comments & Docstrings in English**: All inline comments (`//`, `#`), block comments, module docstrings, TSDoc/JSDoc tags, and Rustdoc documentation must be authored strictly in clear, professional English.
  - ❌ *Prohibited:* Writing comments in Korean, Japanese, Chinese, or other non-English languages inside source files (e.g. `// 사용자 인증 토큰 확인`).
  - ✅ *Required:* Author all technical reasoning in concise English (e.g. `// Validate JWT claims against tenant signing key`).
- **Localized UI Text Isolation**: Non-English strings are strictly isolated to dedicated internationalization resource bundles (e.g. `locales/ko.json`, `i18n/`, `.po` catalogs) meant for end-user UI presentation. Implementation code, comments, error identifiers, and internal logging must remain 100% English.

---

## 4. Anti-Slop Communication & Technical Tone Standards

To eliminate AI-generated conversational fluff, predictive filler patterns ("AI slop"), and sycophantic pleasantries:

### Zero Throat-Clearing & Sycophancy
- **No Flattery or Artificial Excitement**: Never open responses with pleasantries, hyperbolic confirmations, or emotional agreements (e.g. ❌ "완벽하게 완료되었습니다!", ❌ "놀라운 성과를 거두었습니다!", ❌ "귀하의 지적이 전적으로 맞습니다!").
- **No Pretentious Openers or Closers**: Never use meta-announcements or fake-profound summaries (e.g. ❌ "현대 소프트웨어 개발 환경에서...", ❌ "결론적으로 말씀드리면...", ❌ "언제든 추가 질문이 있으시면 편하게 말씀해 주세요").
- **Jump Directly to Technical Reality**: State the finding, the root cause, the concrete diff, and the verification command output immediately.

### Ban on Marketing Hype & Buzzwords
- **Strictly Prohibited Vocabulary**: Eliminate inflated adjectives and marketing fluff (e.g. "혁신적인", "전례 없는", "최첨단", "마법 같은", "원활한/seamless", "강력한/robust", "패러다임 전환").
- **Factual Metrics Only**: Replace puffery with exact parameters: execution time in milliseconds, byte diffs, exit codes, memory footprints, and algorithm complexities ($O(1)$ vs $O(N)$).

### Elimination of Predictive AI Patterns
- **No Binary Contrast Formula**: Ban the formulaic trope *"It's not just X, it's Y"* or *"단순히 A가 아니라 B입니다"*.
- **No Triad Compulsion**: Do not default to arbitrary triads of adjectives, examples, or bullet points unless structurally required by the domain.
- **High Information Density**: Every sentence must introduce a concrete parameter, constraint, diff line, or reproducible fact. Never restate a prior point using synonymous wording.

### Peer-to-Peer Senior Engineering Stance
- Communicate with the sober, objective precision of a principal systems architect.
- When an error or discrepancy is identified, do not engage in performative apologies or defensive rationalization. State the exact delta, the causal breakdown, the fix, and the reproduction evidence.

### 4.2 Technical Documentation Anti-Slop Specification

When authoring technical documentation, architecture decision records (ADRs), RFCs, READMEs, API specifications, or incident post-mortems, autonomous agents must eliminate generative filler and adhere to principal engineering documentation standards:

#### 1. The 5 Archetypes of AI Slop in Technical Documentation

| Archetype | AI Slop Pattern (❌ Prohibited) | Senior Engineering Standard (✅ Required) |
| :--- | :--- | :--- |
| **1. The Grandiose Throat-Clearing<br>(거창한 서두/목청 가다듬기)** | *"In today's fast-paced digital ecosystem, building scalable, robust web apps is more critical than ever. Welcome to Project X, an innovative solution..."* | Start on Line 1 with the concrete contract:<br>*"Distributed telemetry aggregator receiving OpenTelemetry gRPC spans and writing partitioned Parquet batches to S3."* |
| **2. The Marketing Adjective Deluge<br>(형용사 범람)** | Inflated adjectives: *"seamlessly integrate"*, *"cutting-edge"*, *"empowers"*, *"game-changing"*, *"rich tapestry"*, *"effortless"*. | Hard engineering parameters: Throughput $\ge 50{,}000\text{ RPS}$, latency $p99 \le 12\text{ms}$, heap budget $\le 256\text{MB}$, zero-allocation buffer pools. |
| **3. The Content-Free Laundry List<br>(알맹이 없는 나열)** | Generic bullet points applicable to any software:<br>• *Scalable: Scales to your needs.*<br>• *Secure: Built with security in mind.*<br>• *Modular: Easy to maintain.* | Concrete architectural choices & invariants:<br>• *Storage: PostgreSQL 16 partitioned by tenant UUIDv7.*<br>• *Concurrency: Bounded channel(50k) with backpressure.*<br>• *Auth: OAuth 2.1 PKCE with SHA-256 verifier.* |
| **4. The Circular Definition<br>(동어반복 정의)** | Restating the title in the body:<br>*"UserManager: Manages users in the user management system."*<br>*"ConfigService: A service for configuring settings."* | Invariants, lifecycle, and failure modes:<br>*"UserManager: Validates tenant quota, enforces unique email constraints across active shards, and issues signed session cookies with 15-minute TTL."* |
| **5. The Sycophantic Outro<br>(작위적 격려와 마무리)** | Cheerleading and generic sign-offs:<br>*"Congratulations! You are now ready to unleash the full power of X! Happy coding! Feel free to reach out!"* | Operational Runbook & Troubleshooting Matrix:<br>Provide exact failure symptoms, diagnostic CLI commands, root causes, and remediation runbooks. |

#### 2. The 6 Mandatory Pillars of Senior Technical Documentation

Every technical specification, architecture document, or README must follow this high-signal structure:
1. **Executive Contract & Boundaries**: Exactly 1-2 sentences defining what the system does, its boundary limits, and who consumes it.
2. **System Invariants & SLAs**: Concrete numerical targets (throughput, latency percentiles $p50/p99$, memory limits, durability guarantees).
3. **Architecture Topology & Trust Boundaries**: ASCII or Mermaid sequence/flowcharts showing component interactions and trust boundaries.
4. **Deterministic Quickstart**: Copy-pasteable CLI commands with verified flags, expected terminal output, and zero unspecified manual prerequisites.
5. **Architectural Decision Record (ADR) Matrix**: Problem context, selected decision, concrete trade-offs, and **explicitly rejected alternatives** (e.g. *"Why Redis was chosen over Memcached; why Kafka was rejected in favor of PostgreSQL Outbox"*).
6. **Failure Modes & Operational Runbook**: Explicit failure matrix mapping:
   $$\text{Symptom} \longrightarrow \text{Diagnostic Command} \longrightarrow \text{Root Cause} \longrightarrow \text{Remediation Action}$$

---

## 5. Code Review & Quality Evaluation Standards

### Understand the Review Scope
- Inspect the complete relevant diff before evaluating individual lines.
- Trace callers, interfaces, data flows, and tests to understand intended behavior.
- Distinguish defects introduced by current changes from unrelated pre-existing code.
- Do not expand a focused change review into an unrelated repository-wide refactoring unless requested.

### Review Priority Hierarchy
Evaluate code issues in strict descending order of priority:
1. **Functional Correctness**: Behavioral bugs, regression risks, logic inversions, off-by-one errors.
2. **Security & Authorization**: Insecure direct object references, injection flaws, missing auth checks, privilege escalation.
3. **Data Integrity**: Unintended data loss, data corruption, partial database writes, unhandled null states.
4. **Reliability & Concurrency**: Race conditions, unhandled Promise rejections, resource leaks, deadlocks, lack of backpressure.
5. **API & Backward Compatibility**: Breaking changes in signatures, response schemas, or serialization formats.
6. **Performance & Resource Consumption**: Algorithmic complexity regressions ($O(N^2)$ inside loops), memory bloat, unindexed database queries.
7. **Maintainability & Architecture**: Premature abstractions, cyclic dependencies, violations of modular boundaries.
8. **Naming & Conventions**: Typos, stylistic inconsistencies, formatting discrepancies.

### Evidence-Based Defect Reporting
Report an issue only when supported by the implementation, a reproducible condition, or a clearly established contract violation. Each actionable finding must provide:
- **Location**: File path and relevant line number.
- **Problem Statement**: The concrete problematic implementation pattern.
- **Condition**: Exact inputs, execution flow, or environmental states required for the issue to manifest.
- **Impact**: Realistic operational or user-facing impact.
- **Recommended Correction**: Concrete code snippet showing the minimal, idiomatically correct fix.

### Severity Grading
- **Critical**: Catastrophic security breach, irrecoverable data loss, or total service downtime.
- **High**: Significant correctness, security, or reliability defect breaking core functionality.
- **Medium**: Defect occurring under specific edge conditions with bounded blast radius.
- **Low**: Localized maintenance, type-tightening, or performance optimization.

---

## 6. Technical Diagrams & Visual Presentation Standards

When generating, editing, or rendering text-based ASCII and Unicode diagrams, architecture charts, or flowcharts:

### The Neuro-Symbolic Invariant (Never Eyeball Monospace 2D Layouts)
- **Token Prediction Cannot Count 2D Monospace Widths**: Autoregressive language models predict 1D tokens sequentially and cannot natively track 2D visual grid alignment. Eyeballing spaces manually in prose guarantees broken right borders and warped boxes.
- **Mandatory Programmatic Computation**:
  - For ASCII/Unicode box diagrams: Always generate or verify the layout using the deterministic renderer:
    ```bash
    python skills/engineering/tooling/ascii-diagram/scripts/render_box.py --title "Title" --lines "Line 1" "Line 2" --style rounded
    ```
  - For complex workflows or schedules: Prefer native Mermaid diagrams (`flowchart TD`, `sequenceDiagram`) or Markdown tables over manual text drawing.

### Visual Display Width over String Length (UAX #11)
- In monospace editors and terminals, CJK ideographs, Hangul syllables, and fullwidth characters occupy **2 visual columns** (`width = 2`), while ASCII characters occupy **1 visual column** (`width = 1`).
- Never calculate box padding using raw string length (`.length` or `len()`).
- Total visual display width of every line in a box must match with mathematical equality:
  $$W_{\text{top}} = W_{\text{content}} = W_{\text{bottom}}$$
  Where $W_{\text{content}} = 1 + P_{\text{left}} + W_{\text{visual}}(\text{Label}) + P_{\text{right}} + 1$.

### The Zero-Tab Law
- Never inject tab characters (`\t`) inside any diagram buffer, code block, or comment.
- All horizontal indentation, spacing, and column offsets must consist exclusively of standard ASCII space characters (`U+0020`).

### Stylistic Cohesion & Character Family Purity
Never mix incompatible character sets within the same diagram. Adhere strictly to one family:
- **Unicode Light Family (Default)**: `┌`, `─`, `┐`, `│`, `└`, `┘`, `┬`, `┴`, `├`, `┤`, `┼`, `▼`, `▲`, `►`, `◄`.
- **Pure ASCII Family**: `+`, `-`, `|`, `-->`, `<--`, `v`, `^` (for plain text emails or legacy terminals).
- **Unicode Rounded Family**: `╭`, `─`, `╮`, `│`, `╰`, `╯` (for polished presentation cards).
- ❌ *Prohibited:* Mixing ASCII `|` pipes with Unicode `─` rules, or mixing square and rounded corners.

### Vertical Connector Alignment
- Intermediate vertical connector pipes (`│` or `|`) and arrowheads (`▼` or `v`) must share the exact center column coordinate of the connected box anchor:
  $$X_{\text{connector}} = X_{\text{box\_start}} + \lfloor \frac{W_{\text{box}}}{2} \rfloor$$

---

## 7. Related Domain Skills Dispatch

When authoring or automating documentation, diagrams, or deep reviews:
- **Code Documentation Playbooks**: Activate [`skills/engineering/tooling/code-documentation`](../skills/engineering/tooling/code-documentation/SKILL.md) for docstring templates and linters.
- **Diagram Verification Tooling**: Activate [`skills/engineering/tooling/ascii-diagram`](../skills/engineering/tooling/ascii-diagram/SKILL.md) to execute automated visual width and box-geometry validators.
- **VS Code Workspace & Launch Pipelines**: Activate [`skills/engineering/tooling/vscode`](../skills/engineering/tooling/vscode/SKILL.md) for team-wide formatters, polyglot launch debugging, and tasks automation.
