# ADR-0001: [Short Decision Title]

- **Status**: Proposed | Accepted | Rejected | Deprecated | Superseded by ADR-NNNN
- **Date**: YYYY-MM-DD
- **Author**: [Author / Team]
- **Related Spike / RFC**: [Link or N/A]

## Context and Problem Statement
Describe technical constraints, operational incidents, scale limits, and why a decision is required now.

## Decision Drivers
- **Performance**: [e.g., p99 read latency <= 10ms at 20k RPS]
- **Reliability**: [e.g., RPO = 0, automatic multi-AZ failover]
- **Operational Simplicity**: [e.g., Day-2 maintenance and on-call burden]
- **Security / Compliance**: [e.g., encryption, tenant isolation boundary]

## Considered Options
- **Option A**: [Incumbent / Baseline]
- **Option B**: [Candidate Architecture 1]
- **Option C**: [Candidate Architecture 2]

## Decision Outcome
Chosen option: **[Option X]**, justified by [verified spike metric / Pugh score / constraint fit].

### Falsified Assumptions & Rejected Alternatives
- **[Option Y rejected]**: [Exact falsification finding, failure mode, or unmet SLA]

### Positive Consequences
- [Measured benefit or reduced maintenance burden]

### Negative Consequences / Accepted Technical Debt
- [Accepted trade-off, migration overhead, or invariant callers must uphold]
