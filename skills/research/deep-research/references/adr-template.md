# Architecture Spike, FMEA & ADR Lifecycle Guide

Guidelines for executing Failure Modes and Effects Analysis (FMEA) stress-tests, weighted architecture scoring, and Architecture Decision Record (ADR) lifecycle governance. Use [../resources/adr_template.md](../resources/adr_template.md) for the concrete ADR starter file.

---

## 1. Failure Modes and Effects Analysis (FMEA) Guide

When evaluating an architecture candidate during Phase 2-3 spikes, probe failure modes rather than happy paths:

| Failure Mode | Trigger / Cause | Severity (1-5) | Detection Method | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Downstream Saturation** | Surge in webhook or fan-out traffic | 4 | p99 queue depth / latency alert | Bounded queue + circuit breaker + exponential backoff with jitter |
| **Schema Evolution Break** | Incompatible deserialization change | 5 | Contract tests in CI | Protobuf/JSON Schema backward-compatibility gates |
| **Silent Data Corruption** | Partial write on network timeout or split-brain | 5 | Reconciler worker diffs | Idempotency keys + Transactional Outbox |
| **Cache Coherence Drift** | Cross-region async replication bypassing local read-through cache | 4 | Stale-read Canary check | Short TTLs, versioned keys, or bypassing cache for read-after-write |

---

## 2. Weighted Decision Matrix vs. Pugh Matrix

- **Weighted Decision Matrix (Default)**: Define 4-6 decision criteria whose weights sum to `1.00`. Score every option `1` (fails threshold) to `5` (exceeds target with headroom) using measured spike metrics.
- **Baseline Pugh Matrix**: When comparing candidates against a live incumbent system (`Score = 0`), score each criterion `+1` (better), `0` (equivalent), or `-1` (worse) to avoid false precision before benchmarks exist.

---

## 3. ADR Lifecycle & Versioning Rules

- **Immutable Once Accepted**: Once an ADR reaches `Accepted`, never rewrite its historical reasoning, constraints, or rejected options.
- **Superseding**: When constraints shift, author a new ADR (e.g., `docs/adr/ADR-0058.md`) and update only the prior record's `Status` line to `Superseded by ADR-0058`.
- **Canonical Path**: Store ADRs under `docs/adr/ADR-NNNN.md` alongside project source code so decisions stay versioned in Git history.
