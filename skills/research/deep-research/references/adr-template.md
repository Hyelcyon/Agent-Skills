# Architecture Decision Record (ADR) & Spike Template

A production-ready template and guidelines for logging technical spikes, FMEA stress-tests, and architectural consensus.

---

## 1. Failure Modes and Effects Analysis (FMEA) Guide

When evaluating an architecture candidate, probe these failure scenarios:

| Failure Mode | Trigger / Cause | Severity (1-5) | Detection Method | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Downstream Saturation** | Surge in webhook traffic | 4 | p99 queue latency alarm | Circuit breaker + exponential backoff |
| **Schema Evolution Break** | Deserialization mismatch | 5 | Contract tests in CI | Protobuf backward compatibility checks |
| **Silent Data Corruption** | Partial write on network timeout | 5 | Reconciler worker diffs | Idempotency keys + 2-phase commit |

---

## 2. ADR Lifecycle & Versioning Rules

- **Immutable by Default**: Once an ADR is marked `Accepted`, never edit its historical reasoning or options.
- **Superseding**: If requirements change later, create a new ADR (e.g., `ADR-012: Migrate to ClickHouse`) and mark the old one as `Status: Superseded by ADR-012`.
- **Repository Location**: Store ADRs at `docs/adr/` or `.agents/adr/` alongside the project code for version tracking.
