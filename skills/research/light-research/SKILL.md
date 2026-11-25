---
name: light-research
description: Use when verifying facts, looking up API signatures, investigating compiler/runtime errors, checking version compatibility, performing multi-hop web searches with falsification, or evaluating packages and libraries.
---

# Light Technical Research & Multi-Hop Search Verification

A senior engineering runbook for multi-hop web search, API signature extraction, falsification probing, and empirical verification utilizing multi-query fan-out, deep extraction, and falsification probing.

## When to Use
- Looking up or verifying exact API signatures, method parameters, and return types for third-party libraries or frameworks.
- Investigating compiler errors, runtime exceptions, build failures, or mysterious stack traces.
- Checking version compatibility, deprecations, breaking changes, and migration paths between releases.
- Screening and comparing 2-3 candidate libraries or npm/pip/cargo packages for a focused task.
- Fact-checking technical claims before designing or implementing code.

## When NOT to Use
- Broad multi-month architectural pivots, database rewrites, or cross-cutting organizational redesigns (use `deep-research`).
- Simple inline syntax questions that are entirely self-contained within project files and established standard library specifications.

---

## 5-Phase Operational Protocol

```
Phase 1: Local Lockstep & Query Boundary Formulation (Lockfile version, exact symbol)
Phase 2: Multi-Query Fan-Out (Precision search queries targeting Tier 1 sources)
Phase 3: Upstream Deep Extraction (Reject snippets; inspect primary documentation)
Phase 4: Falsification & Caveat Hunting (Active probing for breaking changes & deprecations)
Phase 5: Empirical Scratch Verification (CLI proof, type-check, scratch script)
```

### Phase 1: Local Lockstep & Query Boundary Formulation
Never search in a version vacuum:
1. Inspect project manifests and lockfiles (`package.json`, `pnpm-lock.yaml`, `Cargo.lock`, `pyproject.toml`, `go.mod`) to extract the exact installed major.minor version.
2. Isolate the exact identifier, method name, or error code into a bounded scope.
3. Formulate the inquiry with explicit version anchors (e.g. `Next.js 15.1`, `Pydantic v2.8`, `Rust 2024`).

### Phase 2: Multi-Query Fan-Out
Rather than relying on a single vague query, execute structured search queries targeting authoritative Tier 1-2 sources:
- **Discovery Query**: `site:<official-docs-domain> "<exact symbol>" <version>`
- **Signature Query**: `site:github.com/<owner>/<repo> "export function <symbol>" OR "def <symbol>"`
- **Diagnostic Query**: `"<exact error message prefix>" site:github.com issues`

### Phase 3: Upstream Deep Extraction & Triangulation
- **Enforce the Anti-Snippet Invariant**: Search snippets are pointers, not evidence. Snippets frequently truncate parameters, omit default arguments, or synthesize hallucinated explanations.
- Cross-verify findings across at least 2 independent authoritative tiers:
  - *Tier 1*: Official framework documentation and API references.
  - *Tier 2*: Maintainer release notes, changelogs, and commit history.
  - *Tier 3*: Official repository issue trackers and merged PR discussions.

### Phase 4: Falsification & Negative Evidence Hunting
Do not fall into confirmation bias loops. Before declaring an approach viable, actively attempt to falsify it:
1. Execute negative probing queries:
   - `<technology> "<symbol>" "breaking change"`
   - `<technology> "<symbol>" "deprecated"`
   - `<technology> "<symbol>" "known issue" OR "caveat"`
2. Verify runtime constraints (e.g., Server vs. Client Components, Edge runtime vs. Node.js runtime, OS-specific requirements).
3. If negative evidence is found, pivot immediately. Never rationalize or force an obsolete API.

### Phase 5: Empirical Scratch Verification
Validate the discovered API or fix before applying it to project files:
1. Execute a zero-dependency scratch script (`scratch/test_api.ts`, `node -e "..."`, `python -c "..."`) or an isolated type check (`tsc --noEmit`, `cargo check`).
2. Verify exact exit codes, runtime outputs, and error states.
3. Report verified evidence and direct canonical documentation links.

---

## Prohibited Anti-Patterns

- ❌ **Shallow Snippet Reliance**: Adopting code, types, or flags solely from a 2-line search preview.
- ❌ **Confirmation Bias Loops**: Searching only for queries that confirm your prior assumption, or rationalizing mistakes when challenged.
- ❌ **Version-Agnostic Searching**: Searching for "React forms" or "Next.js routing" without specifying and validating against the exact installed version.
- ❌ **Skipping Falsification**: Accepting the first matching tutorial without checking for breaking changes or deprecation warnings.
- ❌ **Defending Erroneous Output**: Generating pseudo-evidence or arguing when a command fails; cleanly restart the search loop instead.
- ❌ **Citing SEO Farms or AI Overviews**: Treating unofficial aggregator blogs (GeeksForGeeks, Baeldung, random Medium posts) as primary technical truth.

---

## References & Documentation
- Multi-Hop Search & Gap Detection Guide: [references/multihop-search-protocol.md](./references/multihop-search-protocol.md)
- Falsification & Negative Search Protocol: [references/falsification-and-negative-search.md](./references/falsification-and-negative-search.md)
- Version Locking & Local Grounding: [references/version-locking-and-local-grounding.md](./references/version-locking-and-local-grounding.md)
- Library Triage Scorecard Guide: [references/library-triage-card.md](./references/library-triage-card.md)
- Rapid Package Evaluation Scorecard: [references/rapid-package-evaluation-scorecard.md](./references/rapid-package-evaluation-scorecard.md)
- API Compatibility Verification: [references/api-compatibility-verification.md](./references/api-compatibility-verification.md)

## Resources & Examples
- Search Query Patterns Schema: [resources/search-query-patterns.json](./resources/search-query-patterns.json)
- Source Credibility & Authority Rules: [resources/source-credibility-rules.json](./resources/source-credibility-rules.json)
- Technical Verification Checklist: [resources/verification-checklist.md](./resources/verification-checklist.md)
- Rapid Triage Checklist: [resources/triage_checklist.md](./resources/triage_checklist.md)
- Triage Scorecard Weights: [resources/triage-scorecard.json](./resources/triage-scorecard.json)
- Multi-Hop Search Case Study: [examples/multihop_search_vs_shallow_search.md](./examples/multihop_search_vs_shallow_search.md)
- Falsification Search Regression Prevention: [examples/falsification_search_prevented_regression.md](./examples/falsification_search_prevented_regression.md)
- API Compatibility Triage: [examples/api_compatibility_triage.md](./examples/api_compatibility_triage.md)
- CLI Flag Investigation: [examples/cli_flag_investigation.md](./examples/cli_flag_investigation.md)
- Sample Library Triage: [examples/sample_library_triage.md](./examples/sample_library_triage.md)
