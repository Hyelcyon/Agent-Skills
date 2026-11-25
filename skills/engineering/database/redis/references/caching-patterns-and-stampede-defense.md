# Caching Patterns, Stampede Mitigation, and Failure Defenses

This document details caching architectures, cache stampede (thundering herd) mitigation strategies, and failure-mode defenses in distributed systems.

---

## 1. Primary Caching Topologies

### 1.1 Cache-Aside (Lazy Loading)
- **Flow**: Application checks cache first. If hit, returns data. If miss, queries primary database, writes result into cache with TTL, and returns data.
- **Trade-off**: Cache only contains requested data (memory efficient). Initial request for each key incurs higher latency (cache miss latency).

### 1.2 Write-Through
- **Flow**: Application writes data to the cache, and the cache synchronously writes to the database.
- **Trade-off**: Cache is always fresh and consistent with the database. Higher write latency.

### 1.3 Write-Behind (Write-Back)
- **Flow**: Application writes directly to the cache, which acknowledges immediately. Cache asynchronously drains batches of writes to the persistent database.
- **Trade-off**: Extremely fast write throughput. Risk of permanent data loss if Redis crashes before dirty buffers are flushed to persistent storage.

---

## 2. Cache Failure Modes and Defenses

```
+-------------------------------------------------------------+
| Cache Stampede (Thundering Herd)                            |
| Hot key expires -> 5,000 concurrent requests miss cache ->   |
| 5,000 queries hit PostgreSQL at once -> Database collapses  |
+-------------------------------------------------------------+
                              |
                     Mitigation Solutions:
            1. Mutex Locking around DB query
            2. Probabilistic Early Expiration (XFetch)
                              |
+-------------------------------------------------------------+
| Cache Penetration                                           |
| Queries for non-existent IDs (e.g. id=-1) bypass cache ->   |
| Every request hits database directly                        |
+-------------------------------------------------------------+
                              |
                     Mitigation Solutions:
            1. Bloom Filter fronting the cache
            2. Short-lived Null Object Caching (TTL: 30s)
                              |
+-------------------------------------------------------------+
| Cache Avalanche                                             |
| Thousands of keys initialized at 00:00 with 24h TTL ->      |
| All keys expire simultaneously at 00:00 the next day         |
+-------------------------------------------------------------+
                              |
                     Mitigation Solutions:
            Add Random Jitter: TTL = base_ttl + rand(0, 300)s
```

---

## 3. Probabilistic Early Expiration (The XFetch Algorithm)

Instead of waiting for a hot key to expire, a reader can compute whether it should probabilistically refresh the cache in the background while still returning the cached value.

### Mathematical Formulation
$$\Delta \times \beta \times (-\ln(\text{random}())) > (\text{expiry} - \text{currentTime})$$

- $\Delta$: Time taken to compute the value from the database (in seconds).
- $\beta$: Constant aggressiveness parameter ($\beta > 0$, typically $1.0$).
- $\text{random}()$: Uniform random variable bounded strictly away from zero, $(0, 1]$ (clamp `max(random.random(), 1e-9)` so `ln(0)` never occurs).
- $\text{expiry} - \text{currentTime}$: Remaining TTL in seconds (store the jittered expiration timestamp matching `max(1, ttl + jitter)` passed to Redis `EX`).

As the remaining TTL approaches zero, $-\ln(\text{random}())$ increases the probability that a worker will trigger an early refresh. One or a few background/reader workers recompute the value and refresh the cache before it reaches 0 TTL. When running multi-key cache invalidations or `MGET` batches on Redis Cluster, co-locate related keys on the same hash slot with `{hash_tag}` prefixes (e.g., `prod:tenant:{t_101}:profile`).
