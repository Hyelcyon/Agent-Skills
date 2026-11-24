# ADR-042: Migrate Primary Session Store to DynamoDB with DAX

## Status
Accepted

## Context
Redis cluster memory costs scaled linearly with active user growth. Peak hour traffic led to memory saturation incidents during marketing campaigns.

## Decision Drivers
- Cap infrastructure idle costs while supporting 10x traffic spikes
- Maintain sub-10ms read latencies at p99
- Eliminate manual Redis memory sharding maintenance

## Considered Options
- Option A: Vertical scaling of existing Redis Cluster
- Option B: DynamoDB with DAX (DynamoDB Accelerator)

## Decision Outcome
Chosen option: Option B. Technical spike confirmed sub-8ms p99 read latency and reduced idle monthly infrastructure cost by 42%.

### Positive Consequences
- Zero manual partition management
- Multi-region replication supported natively

### Negative Consequences / Accepted Technical Debt
- Local development requires running local DynamoDB emulators
- Eventual consistency nuances must be handled in rare write-after-read scenarios
