---
trigger: model_decision
description: "Apply when researching current technologies, frameworks, APIs, libraries, technical specifications, compatibility, software versions, external technical claims, or evaluating implementation alternatives."
---

# Research and Technical Verification (Multi-Hop Operational Standard)

## 1. Epistemic Humility & Mandatory Search Triggers

- **Never Assume from Parametric Memory**: Internal training weights freeze at a cutoff and frequently conflate major version semantics, deprecate APIs silently, or hallucinate configuration keys.
- **Mandatory Proactive Search Triggers**: You MUST execute proactive multi-hop search and verification whenever the task involves:
  1. Third-party library APIs, methods, types, or return signatures.
  2. Framework configuration keys, schema definitions, or CLI flags.
  3. Compiler errors, runtime exceptions, or stack trace diagnosis.
  4. Version upgrades, migration steps, or deprecation notices.
  5. Fast-moving ecosystems (e.g. Next.js, React 19, Tailwind, Vite, AI SDKs, Pydantic v2, Rust crates).
- **Prohibited Practice**: Never skip search under the rationalization that "I already know this concept" or "this is a simple question." Searching is not a sign of ignorance; it is the mandatory instrument of truth grounding.

## 2. Local Environment & Version Locking

- Always inspect local project manifests and lockfiles (`package.json`, `pnpm-lock.yaml`, `Cargo.lock`, `pyproject.toml`, `go.mod`, `pom.xml`) before formulating queries.
- Extract the exact target version (e.g., `next@15.1.0`, `pydantic@2.8.2`, `react@19.0.0`) and embed that exact version number into the search query.
- Never apply documentation, blog tutorials, or StackOverflow patterns for version $N$ to an environment running version $N-1$ or $N+1$ without explicitly validating the migration delta.

## 3. The Anti-Snippet Invariant & Source Hierarchy

- **Snippets are Pointers, Not Truth**: Search engine summary snippets, meta descriptions, and AI-generated overviews are discovery aids only. They frequently truncate optional parameters, omit critical default values, or synthesize hallucinated explanations.
- **Never Synthesize from Snippets Alone**: When an API signature or architectural recommendation is required, you must retrieve and inspect the primary official documentation page, the upstream GitHub source repository, or the official release notes.
- **5-Tier Source Authority Hierarchy**:
  - **Tier 1 (Authoritative Truth)**: Official project documentation, language/runtime specifications, and API reference schemas.
  - **Tier 2 (Canonical Evolution)**: Maintainer-authored release notes, changelogs, migration guides, and commit history.
  - **Tier 3 (Maintainer Repositories)**: Official GitHub issues, RFC pull requests, and maintainer discussions.
  - **Tier 4 (Recognized Engineering Publications)**: Peer-reviewed benchmarks, vendor architecture deep-dives, and core contributor blogs.
  - **Tier 5 (Secondary/Community)**: StackOverflow, Medium, general tech blogs, and forum discussions. Must be cross-verified against Tier 1-2 before use.

## 4. Multi-Hop Search & Falsification Protocol

When verifying external technical knowledge, do not stop at a single query. Execute the 3-hop verification cycle:

1. **Hop 1: Discovery & Specification**:
   - Query exact symbol names, version numbers, and official documentation anchors.
   - Example: `site:nextjs.org/docs "useActionState" "next/form" 15`
2. **Hop 2: Exact Signature & Type Inspection**:
   - Retrieve exact method signatures, required and optional arguments, return types, and runtime environment requirements (Server vs. Client components, Node vs. Edge).
3. **Hop 3: Falsification & Negative Evidence Hunting**:
   - Actively search for failure modes, breaking changes, deprecation notices, and known bugs before implementing.
   - Formulate disproving queries: `[symbol] "breaking change" OR "deprecated" OR "known issue" OR "not working"`.
   - Never settle for confirmation bias; prove that the candidate approach has not been superseded or broken in the target version.

## 5. Fine-Grained Epistemic Deconstruction

Never evaluate a complex technical claim or framework feature as an indivisible whole. Deconstruct every external technical assertion into atomic, independently checkable components:
1. **Runtime Availability**: Does the symbol or flag physically exist in the target version runtime?
2. **Signature & Parameter Shape**: What are the mandatory vs. optional parameters, default values, and return types?
3. **Execution Context**: Is the feature restricted to specific runtimes (e.g., Server vs. Client Components, Node.js vs. Cloudflare Workers, Edge vs. V8)?
4. **Lifecycle & Deprecation**: Has this API been superseded, flagged as unstable, or scheduled for removal in future releases?

## 6. Environmental Reality Grounding over Internal Narrative

- **The External World is the Ultimate Arbiter**: The output of real execution (compilers, linters, test runners, curl probes, HTTP status codes) always supersedes the agent's internal generative confidence.
- **No Defensive Rationalization**: If an execution tool returns an error, or if a user points out an inconsistency, immediately accept that the initial hypothesis was false.
- **Clean Hypothesis Rollback**: Isolate the failing assumption, formulate new falsification queries, and test against primary documentation before rewriting code.

## 7. Empirical Scratch Verification

- Whenever feasible, do not introduce unverified external patterns directly into production files.
- Validate uncertain API signatures or syntax using a lightweight scratch script or isolated command-line check (e.g. `node -e`, `python -c`, `cargo check`, or standalone scratch test) to confirm real runtime behavior.

## 8. Reporting Verified Technical Findings

When reporting technical findings or recommendations, provide:
- Exact verified version compatibility (e.g., "Verified on Next.js 15.1+; deprecated in Next.js 14").
- Direct canonical documentation links or release note references.
- Verified breaking changes, edge cases, and accepted trade-offs.
- Distinguish verified empirical facts from theoretical architectural opinions.

## 9. Research Skills Dispatch

When research is triggered, route to the corresponding specialized skill:
- **Fast Technical Triage & Multi-Hop Verification**:
  Activate [`skills/research/light-research`](../skills/research/light-research/SKILL.md) for precision multi-hop searches, API signature validation, compiler/runtime error diagnostics, and library triage.
- **Architectural Spikes & Major Evaluations**:
  Activate [`skills/research/deep-research`](../skills/research/deep-research/SKILL.md) for multi-variable trade-offs, Pugh decision matrices, failure-mode stress testing, and formal Architecture Decision Records (ADRs).
