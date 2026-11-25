# ADR-0042: Migrate Primary Session Store to DynamoDB with DAX

- **Status**: Accepted
- **Date**: 2026-10-15
- **Author**: Core Platform Engineering
- **Related Spike / RFC**: Spike-2026-Session-Store

## Context and Problem Statement
In-memory Redis Cluster RAM costs scaled linearly with active authenticated sessions. Peak campaign traffic triggered memory eviction pressure and forced emergency vertical node resizing.

## Decision Drivers
- Cap idle storage/compute costs while absorbing 10x burst read spikes
- Maintain sub-10ms session read latencies at p99 within primary region
- Eliminate manual Redis shard rebalancing during traffic growth

## Considered Options
- **Option A**: Vertical and horizontal scaling of self-managed Redis Cluster
- **Option B**: Amazon DynamoDB with DAX (DynamoDB Accelerator) in-region cache
- **Option C**: DynamoDB without DAX (direct `GetItem` reads)

## Decision Outcome
Chosen option: **Option B (DynamoDB + DAX)** for hot session reads within the primary region. Spike load testing measured 6.4ms p99 cache-hit read latency and projected a 42% idle monthly infrastructure cost reduction.

### Falsified Assumptions & Rejected Alternatives
- **Option A rejected**: Maintaining 3x memory headroom for burst marketing windows remained cost-prohibitive.
- **Option C rejected**: Uncached DynamoDB reads hit 18-24ms p99 under burst tail conditions, exceeding the 10ms gateway budget.

### Positive Consequences
- Zero manual shard or memory-pressure tuning for cold session retention (TTL expiration handled natively)
- Predictable on-demand capacity scaling for write bursts

### Negative Consequences / Accepted Technical Debt
- **Regional Cache Scope**: DAX is strictly an in-region read-through cache and does **not** receive invalidations from DynamoDB Global Tables cross-region replication; cross-region failover sessions must bypass DAX (`consistent` direct DynamoDB read) or tolerate the configured item TTL window.
- Local development requires running DynamoDB Local in Docker alongside a mocked cache layer (DAX has no official local emulator).
