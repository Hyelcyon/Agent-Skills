---
trigger: model_decision
description: "Apply when writing, modifying, refactoring, reviewing, or documenting source code across any language, bridging timeless senior craftsmanship with AI-native verification discipline, eliminating trivial comments, enforcing English-only code, or rendering ASCII diagrams."
---

# Senior & AI-Native Engineering Standards

This rule bridges timeless **Senior Software Engineering Philosophy** (deep modules, root-cause ownership, minimal coherent diffs, "why" comments) with **AI-Native Execution Discipline** (context economy, REPL/browser grounding, hypothesis falsification, zero AI slop, and empirical proof).

---

## 1. Unified Philosophy: Senior Craft + AI-Native Rigor

1. **Deep Modules & YAGNI (The Best Code is Code Never Written)**:
   - Pull complexity downward behind simple interfaces; reject premature abstractions, single-use wrappers, and speculative flags.
   - Reuse existing codebase primitives and standard library APIs before adding dependencies.
2. **Root-Cause Ownership & Minimal Coherent Diffs**:
   - Never apply symptom patches over uninvestigated state corruption; trace callers and fix defects at their origin.
   - Touch only the lines required by the task; never mix unrelated formatting or opportunistic rewrites into a targeted fix.
3. **Context Economy & Progressive Hydration**:
   - Token and attention budgets are finite. Search with targeted grep (`rg -n`) and read only relevant line slices rather than loading whole folders.
   - Hydrate matching `.gemini/knowledge/knowledge.json` cards and domain `SKILL.md` runbooks on demand.
4. **Hypothesis Branching & REPL/Browser Grounding (Never Eyeball Code)**:
   - Formulate 2–3 falsifiable hypotheses for non-trivial bugs instead of linear trial-and-error edits.
   - Verify uncertain APIs, regexes, or UI layouts in an isolated scratch check (`node -e`, `python -c`, `tsc --noEmit`, or live browser capture) before committing to production files.
5. **Decoupled Adversarial Verification & Clean Rollback**:
   - Separate code generation from adversarial critique: probe `null`/empty/timeout/concurrency edges and caller contracts.
   - If an edit triggers cascading failures, roll back cleanly to the baseline immediately—never stack speculative patches.

---

## 2. Senior Code Commenting Standards ("Why", Never "What")

- **Code Speaks First**: Express intent through crisp naming, narrow types, and shallow control flow before writing comments.
- **5 Prohibited AI-Slop Comment Archetypes**:
  1. **Echo Parrot**: Repeating syntax (`// increment i`, `// check if user is null`).
  2. **Category Billboard**: Decorative dividers (`// ===== HELPERS =====`).
  3. **Changelog Tombstone**: Session/AI provenance (`// Fixed by AI for #102`); rely on Git history.
  4. **Trivial Param Echo**: JSDoc/docstrings that merely restate parameter names instead of formats, invariants, and `@throws`.
  5. **Speculative Hand-Waving**: Vague deferrals (`// TODO: handle later`, `// might be null`).
- **4 Valid Reasons to Comment**: (1) non-obvious trade-offs/rejected alternatives, (2) upstream vendor/OS/browser quirks with links, (3) concurrency/lock ordering invariants, and (4) performance/memory layout bounds.
- **Formal Public Boundaries & Dead Code**: Document public exports with TSDoc/Google-style Python/Rustdoc contracts; update or delete stale comments immediately and never leave commented-out dead code.

---

## 3. Mandatory English-Only Code Standard

- All identifiers (variables, functions, classes, types), inline comments, docstrings, and log messages must be written strictly in English.
- User-facing non-English UI strings belong exclusively in dedicated localization bundles (`locales/*.json`, `i18n/`).

---

## 4. Anti-Slop Communication & Technical Documentation

- **Zero Throat-Clearing & Sycophancy**: Skip flattery, hyperbole, and filler openers/closers; state findings, root causes, diffs, and exit codes directly.
- **Ban Marketing Buzzwords & Cliché Tropes**: Replace *"seamless"*, *"robust"*, *"cutting-edge"*, *"It's not just X, it's Y"* with real parameters (ms, bytes, $O(N)$, exact exit codes).
- **6 Pillars of Technical Docs (ADRs, RFCs, READMEs)**:
  1. 1–2 sentence Executive Contract & Boundaries
  2. Numerical SLAs / Invariants
  3. Topology & Trust Boundaries (Mermaid or verified ASCII)
  4. Deterministic Quickstart commands
  5. Trade-offs & Explicitly Rejected Alternatives
  6. Failure Matrix (`Symptom -> Diagnostic Command -> Root Cause -> Remediation`)

---

## 5. Code Review Priority & Evidence Standard

Inspect the complete diff and trace callers before judging lines. Grade findings strictly in descending order:
1. Functional Correctness -> 2. Security & AuthZ -> 3. Data Integrity -> 4. Concurrency & Reliability -> 5. API Compatibility -> 6. Performance -> 7. Maintainability -> 8. Naming.

Report defects only with **Location (`file:line`)**, **Condition**, **Impact**, and **Minimal Fix**, graded `Critical` / `High` / `Medium` / `Low`.

---

## 6. Technical Diagrams (Neuro-Symbolic & UAX #11)

- Autoregressive token prediction cannot eyeball 2D monospace alignment. Use `python skills/engineering/tooling/ascii-diagram/scripts/render_box.py` or Mermaid for diagrams.
- Enforce **UAX #11** visual column widths (CJK/fullwidth = `2`, ASCII = `1`), **Zero-Tab (`U+0020` spaces only)**, single box-drawing character family purity (`┌─┐│└┘` or `╭─╮│╰╯` or `+-|`), and exact vertical connector alignment.

---

## 7. Related Craft & Maintenance Skills Dispatch

- **Senior Minimal-Diff Craft**: [`skills/misc/senior`](../skills/misc/senior/SKILL.md)
- **Long-Term Maintenance & Upgrades**: [`skills/misc/maintenance`](../skills/misc/maintenance/SKILL.md)
- **Code Documentation & Docstrings**: [`skills/engineering/tooling/code-documentation`](../skills/engineering/tooling/code-documentation/SKILL.md)
- **ASCII/CJK Diagram Verification**: [`skills/engineering/tooling/ascii-diagram`](../skills/engineering/tooling/ascii-diagram/SKILL.md)
- **VS Code Workspace Tooling**: [`skills/engineering/tooling/vscode`](../skills/engineering/tooling/vscode/SKILL.md)
