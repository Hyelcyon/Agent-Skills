# Memory Optimization, Internal Data Encodings, and Eviction Policies

This document covers memory layout internals (listpack, ziplist, intset), memory budget sizing, and eviction algorithms in Redis.

---

## 1. Eviction Policies Architecture

When Redis reaches `maxmemory`, it must either reject incoming writes or evict existing keys based on the configured policy.

| Eviction Policy | Algorithm | Scope | Production Recommendation |
| :--- | :--- | :--- | :--- |
| `volatile-lru` | Least Recently Used | Keys with explicit TTL | Safe for shared databases where some keys are persistent |
| `allkeys-lru` | Least Recently Used | All keys | Standard choice for pure caching layers |
| `volatile-lfu` | Least Frequently Used | Keys with explicit TTL | Superior for bursty traffic; preserves hot frequency |
| `allkeys-lfu` | Least Frequently Used | All keys | Best for pure cache layers with power-law access patterns |
| `volatile-ttl` | Shortest Remaining TTL | Keys with explicit TTL | Evicts keys closest to expiration |
| `noeviction` | None (Throws OOM error) | All keys | Mandatory for stateful queuing (Redis Streams/Celery) |

---

## 2. Memory Compact Encodings

Redis uses specialized memory-compact data structures when collections are small:

### 2.1 Hashes vs Strings
Storing 1,000,000 individual user profile objects as separate string keys (`user:100:name`, `user:100:email`):
- Each string key incurs an independent `robj` header, dictionary entry, and Jemalloc allocation overhead (~60-90 bytes overhead per key).

Storing profiles within a partitioned hash (`HSET user:100 name "Alice" email "alice@corp.com"`):
- Encoded as a continuous `listpack` in memory.
- Reduces memory footprint by up to 60-70% compared to flat string keys.

### 2.2 Configuration Tuning for Compact Structures
```text
hash-max-listpack-entries 512
hash-max-listpack-value 64
zset-max-listpack-entries 128
zset-max-listpack-value 64
set-max-intset-entries 512
```

---

## 3. Memory Diagnostics & Big Key Triage

```bash
# Sample keyspace with 100ms sleep between SCAN batches (run on a replica when available)
redis-cli --bigkeys -i 0.1

# Analyze memory consumed by a specific key in bytes
redis-cli MEMORY USAGE "prod:session:active_users"

# Check memory fragmentation ratio (used_memory_rss / used_memory)
redis-cli INFO memory | grep mem_fragmentation_ratio
```
A fragmentation ratio $> 1.5$ indicates significant memory wasted by the OS allocator. Enable automatic defragmentation:
```text
activedefrag yes
active-defrag-ignore-bytes 100mb
active-defrag-threshold-lower 10
```
