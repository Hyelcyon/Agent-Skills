---
name: deep-research
description: Use when conducting comprehensive architectural spikes, technology evaluations, database or framework migrations, trade-off analyses with decision matrices, or authoring Architecture Decision Records (ADRs).
---

# Deep Technical Research & Architecture Evaluation

A senior engineering framework for executing technical spikes, evaluating multi-variable trade-offs, and producing defensible Architecture Decision Records (ADRs).

## When to Use
- Evaluating major architectural transitions (e.g., REST to gRPC, Monolith to Microservices, SQL to NoSQL).
- Conducting technical spikes to resolve high-ambiguity engineering risks.
- Building a weighted Pugh decision matrix to choose among competing technologies.
- Drafting an Architecture Decision Record (ADR) for organizational consensus.

## When NOT to Use
- Quick fact-checking, single-package comparisons, or error lookups (use `light-research`).
- Simple inline bug fixes or regular feature development.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Hypothesis Formulation & Boundary Definition
Phase 2: Multi-Query Fan-Out & Empirical Spike Stress-Testing
Phase 3: Gap Detection & Iterative Verification Loop
Phase 4: Weighted Decision Matrix Evaluation (Pugh Matrix)
Phase 5: ADR Formulation & Consensus Proof
```

### Phase 1: Hypothesis Formulation & Boundary Definition
Define a falsifiable hypothesis before research: *"If we implement [Approach X], we will achieve [Metric Y] under [Condition Z] without exceeding [Constraint C]."* Bound the spike timebox and define explicit non-goals.

### Phase 2: Multi-Query Fan-Out & Empirical Spike Stress-Testing
Decompose the architectural problem and execute parallel multi-query fan-out across distinct technical vectors:
- Vector A (Performance & Backpressure): Benchmark under load and network partition.
- Vector B (Day-2 Operational Overhead): Observability, debugging ergonomics, failover, backup/restore.
- Vector C (Security Blast Radius): Identity, network boundaries, privilege escalation, supply chain.
Execute focused proof-of-concept prototypes to evaluate failure modes rather than happy paths.

### Phase 3: Gap Detection & Iterative Verification Loop
Evaluate gathered evidence through an explicit gap-detection step:
- *Is the empirical evidence complete and reproducible?*
- *Are there conflicting claims between vendor marketing and maintainer issue trackers?*
- *What edge cases, concurrency hazards, or migration risks remain unverified?*
If significant gaps or contradictions are detected, reformulate targeted follow-up queries and continue the loop before proceeding to decision matrices.

### Phase 4: Weighted Decision Matrix Evaluation (Pugh / Scoring Matrix)
Quantify candidate alternatives objectively across 4-6 normalized criteria (weights sum to `1.0`, scored `1-5` against defined thresholds; or relative `+1 / 0 / -1` Pugh scoring against an incumbent baseline): performance, operational simplicity, ecosystem health, and migration risk.

### Phase 5: ADR Formulation & Consensus Proof
Codify the chosen direction into an Architecture Decision Record at `docs/adr/ADR-NNNN.md` (4-digit sequential ID, e.g., `ADR-0042.md`) detailing decision drivers, evaluated options, falsified alternatives, and accepted technical debt. Review findings against organizational requirements.

---

## Prohibited Anti-Patterns

- ❌ Initiating open-ended exploratory spikes without explicit falsifiable hypotheses.
- ❌ Recommending technologies solely on popularity without failure mode evaluation.
- ❌ Omitting negative consequences or accepted technical debt in ADR documents.
- ❌ Choosing bleeding-edge tools for mission-critical core systems without Day-2 operational analysis.
- ❌ Relying on vendor-published marketing benchmarks without independent reproduction.

---

## References & Documentation
- ADR Architecture Template: [references/adr-template.md](./references/adr-template.md)
- Comparative Technical Benchmarking: [references/comparative-technical-benchmarking.md](./references/comparative-technical-benchmarking.md)
- ADR Governance Standard: [references/architecture-decision-records-standard.md](./references/architecture-decision-records-standard.md)

## Resources & Examples
- Production ADR Starter: [resources/adr_template.md](./resources/adr_template.md)
- Standard RFC Spec Template: [resources/rfc-template.md](./resources/rfc-template.md)
- Empirical Evidence Matrix: [resources/evidence-matrix-template.json](./resources/evidence-matrix-template.json)
- Sample DynamoDB Migration ADR: [examples/adr_dynamodb_migration.md](./examples/adr_dynamodb_migration.md)
- Comparative Messaging Benchmark: [examples/comparative_benchmark_report.md](./examples/comparative_benchmark_report.md)
- STRIDE Threat Model Assessment: [examples/security_threat_model_research.md](./examples/security_threat_model_research.md)
