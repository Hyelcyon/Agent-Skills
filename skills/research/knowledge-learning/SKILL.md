---
name: knowledge-learning
description: Use when capturing, validating, and persisting non-obvious workspace knowledge, distilling user corrections and feedback (/learn), extracting debugging post-mortems, or synthesizing domain invariants into structured project memory.
---

# Continuous Knowledge Learning & Workspace Memory

An operational engineering runbook for systematically capturing, validating, and persisting non-obvious workspace knowledge, user corrections, environment quirks, and architectural invariants across agent sessions.

## When to Use
- Processing explicit user corrections, preferences, or workflow directives (`/learn` workflow).
- Distilling complex, multi-step debugging post-mortems into reusable knowledge assets.
- Capturing non-standard repository build commands, flags, or test harness prerequisites.
- Recording private API quirks, monorepo package boundaries, or platform-specific constraints.
- Maintaining and indexing the centralized knowledge registry (`~/.gemini/config/knowledge/knowledge.json` and `cards/`).

## When NOT to Use
- General fact-checking of standard public libraries or syntax documentation (use `light-research`).
- Conducting technology comparison spikes with evaluation matrices (use `deep-research`).
- Auditing skill directories, Triad quotas, or skills.json registration (use `antigravity-skills-manager`).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Knowledge Discovery & Signal Extraction (Detect correction, post-mortem, quirk)
Phase 2: Falsification & Anti-Hallucination Verification (Empirical test & code proof)
Phase 3: Taxonomy & Categorization Formulation (Rule vs ADR vs Knowledge Card)
Phase 4: Structured Distillation & Storage (Author atomic card / update index)
Phase 5: Retrieval Verification & Invariant Proof (Verify discovery & zero regression)
```

### Phase 1: Knowledge Discovery & Signal Extraction
Identify high-value knowledge signals during execution:
1. Direct user correction ("In this repo, always do X instead of Y").
2. Subtle environment quirk (undocumented CLI flag, port binding rule, clock drift).
3. Resolved architectural incident (circular dependency, silent test failure).

### Phase 2: Falsification & Anti-Hallucination Verification
Empirically verify the fact before codifying it into persistent memory:
- Inspect configuration files (`package.json`, `Makefile`, `turbo.json`, `docker-compose.yml`).
- Run a targeted verification command to confirm the behavior is reproducible.
- Reject assumptions or one-off network anomalies.

### Phase 3: Taxonomy & Categorization Formulation
Determine the appropriate tier per the Knowledge Tier Hierarchy:
- **Standing Behavioral Rule**: Propose addition to `AGENTS.md` or global rules.
- **Architectural Trade-Off**: Create an Architecture Decision Record in `docs/adr/`.
- **Operational Quirk / Workaround / Invariant**: Author an atomic Knowledge Card in `~/.gemini/config/knowledge/cards/` (or workspace `.gemini/knowledge/cards/`).

### Phase 4: Structured Knowledge Distillation
Author an atomic, self-contained knowledge document using the standard template:
- State the context and symptoms with exact CLI error strings.
- Explain the underlying root cause.
- Define the non-negotiable mandatory invariant and prohibited anti-pattern.
- Record the exact verification command and reproducible output proof.

### Phase 5: Retrieval Verification & Index Synchronization
1. Register the new card into `~/.gemini/config/knowledge/knowledge.json` with `id`, `category`, `scope`, `weight`, and `summary`.
2. Verify that future turns targeting matching file scopes can discover and apply the invariant without re-prompting.

---

## Prohibited Anti-Patterns

- ❌ Persisting transient or trivial facts (e.g. standard language syntax already in official docs).
- ❌ Codifying unverified assumptions without executing an empirical verification command.
- ❌ Creating monolithic, multi-topic knowledge notes that bloat context windows.
- ❌ Leaving new knowledge cards unindexed in `knowledge.json`.
- ❌ Adding inline comments to code snippets in knowledge assets.

---

## References & Documentation
- Knowledge Extraction & Distillation: [references/knowledge-extraction-and-distillation.md](./references/knowledge-extraction-and-distillation.md)
- Workspace Memory & Persistence Taxonomy: [references/workspace-memory-and-persistence-taxonomy.md](./references/workspace-memory-and-persistence-taxonomy.md)
- Retrieval-Augmented Agent Continuous Learning: [references/retrieval-augmented-agent-learning.md](./references/retrieval-augmented-agent-learning.md)

## Resources & Examples
- Knowledge Card Template: [resources/knowledge-card.template.md](./resources/knowledge-card.template.md)
- Learning Taxonomy Schema: [resources/learning-taxonomy-schema.json](./resources/learning-taxonomy-schema.json)
- Incident Post-Mortem Template: [resources/post-mortem-learning.template.md](./resources/post-mortem-learning.template.md)
- User Correction Learning Flow Example: [examples/user_correction_learning_flow.md](./examples/user_correction_learning_flow.md)
- Debugging Post-Mortem Example: [examples/debugging_postmortem_to_knowledge.md](./examples/debugging_postmortem_to_knowledge.md)
- Monorepo Quirk Learning Example: [examples/monorepo_quirk_learning.md](./examples/monorepo_quirk_learning.md)
