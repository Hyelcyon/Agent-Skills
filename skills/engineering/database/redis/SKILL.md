---
name: redis
description: Use when authoring, optimizing, or auditing Redis (v7.0 - v7.4+) architectures, designing caching strategies (Cache-Aside, Write-Through), mitigating cache stampedes, implementing distributed locks with Lua atomicity, or managing Redis Streams and eviction policies.
---

# Enterprise Redis Architecture Standard

This skill establishes the production standard for in-memory data storage, caching, distributed coordination, and event streaming using Redis (v7.0+). It enforces sub-millisecond execution, atomic operations, cache stampede mitigation, and strict memory safety.

---

## 1. Senior Craftsmanship Principles

1. **Event Loop Non-Blocking Invariant**: Redis is single-threaded for command execution. Never execute $O(N)$ operations on unbounded keyspaces in production (`KEYS *`, `FLUSHALL`, large `HGETALL`). Use cursor-based `SCAN`, `HSCAN`, or pipeline batching.
2. **Defensive Distributed Locking**:
   - Acquire locks with atomic `SET resource_name token NX PX milliseconds`.
   - Never release a lock with a bare `DEL`. Always use an atomic Lua script that verifies the caller's unique random token to prevent deleting a lock acquired by another thread after a timeout.
3. **Cache Stampede (Thundering Herd) Defense**:
   - High-throughput keys must not expire abruptly and trigger thousands of concurrent database queries.
   - Implement probabilistic early recomputation (XFetch algorithm: $\text{currentTime} - \beta \times \delta \times \ln(\text{random}()) > \text{expiry}$) or distributed mutex locks around cache fills.
4. **Deterministic Eviction and Memory Ceilings**:
   - Always configure explicit `maxmemory` and an intentional `maxmemory-policy` (e.g. `volatile-lru` or `allkeys-lfu`).
   - Default `noeviction` policy causes hard out-of-memory write errors (`OOM command not allowed when used memory > 'maxmemory'`).
5. **Jittered Expirations**: Never set identical fixed TTLs on mass-inserted batch keys. Add random jitter (e.g., $TTL \pm 10\%$) to prevent Cache Avalanche.

---

## 2. Hard Anti-Patterns (Prohibited)

| Anti-Pattern | Operational Risk | Production Remedy |
| :--- | :--- | :--- |
| `KEYS *` in production | Freezes the single-threaded engine; drops all client connections | Use non-blocking `SCAN <cursor> MATCH <pattern> COUNT 100` |
| Releasing distributed lock via `DEL` | Race condition deletes a lock re-acquired by another worker | Release only via token-matching atomic Lua script |
| Caching without TTL | Silent memory leaks until `maxmemory` saturation | Enforce mandatory TTL with random jitter on all volatile keys |
| Unbounded `HGETALL` on large hashes | Network buffer saturation and latency spikes | Restrict hash field sizes or read selectively via `HMGET` / `HSCAN` |
| Bare `MGET` across hundreds of thousands of keys | Monopolizes engine processing time | Chunk multi-key operations into batches of 100-500 keys |
| Storing massive blobs (> 512KB) in strings | Memory fragmentation and I/O serialization bottlenecks | Store large payloads in object storage (S3); store metadata/pointers in Redis |

---

## 3. The 5-Phase Redis Operational Protocol

```
+-------------------------------------------------------------+
| Phase 1: Workload & Memory Profiling                        |
| Inspect INFO memory, maxmemory, eviction policy & fragmentation|
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 2: Key Namespacing & TTL Safety Contract              |
| Enforce domain prefixes (app:entity:id), mandatory TTLs     |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 3: Deterministic Data Structure & Script Design       |
| Select Hashes/ZSets, author atomic Lua scripts & pipelines  |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 4: Concurrency & Lock Auditing                        |
| Verify NX PX acquisition, token validation, heartbeat leases|
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 5: Latency Proof & Slowlog Verification               |
| Profile command execution via SLOWLOG GET and redis-cli     |
+-------------------------------------------------------------+
```

### Phase 1: Workload & Memory Profiling
Inspect memory utilization and fragmentation ratio:
```bash
# Query memory stats and eviction policy
redis-cli INFO memory | grep -E "(used_memory_human|maxmemory_human|mem_fragmentation_ratio)"

# Check slow execution log
redis-cli SLOWLOG GET 10
```

### Phase 2: Key Namespacing & TTL Safety Contract
Adopt structured colon-separated hierarchical namespacing:
```
<env>:<service>:<entity>:<id>:<attribute>
prod:orders:checkout:99481:lock
```

### Phase 3: Deterministic Data Structure & Script Design
Execute atomic multi-operation logic using preloaded SHA1 Lua scripts:
```bash
# Load Lua script into Redis script cache
SCRIPT_SHA=$(redis-cli SCRIPT LOAD "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end")

# Execute via EVALSHA to avoid script re-transmission overhead
redis-cli EVALSHA "$SCRIPT_SHA" 1 "prod:orders:checkout:99481:lock" "worker-token-xyz"
```

### Phase 4: Concurrency & Lock Auditing
Acquire distributed lock atomically:
```bash
# Atomic acquire: Key, Token, NX (only if not exists), PX (millisecond TTL)
redis-cli SET "resource:lock:order:102" "uuid-token-848" NX PX 30000
```

### Phase 5: Latency Proof & Slowlog Verification
Audit latency percentiles from client perspective:
```bash
# Run real-time latency probe
redis-cli --latency-history -i 5

# Inspect top big keys without blocking the server
redis-cli --bigkeys
```

---

## 4. Deep References & Production Assets

- [Caching Patterns and Stampede Defense Reference](./references/caching-patterns-and-stampede-defense.md)
- [Distributed Locks and Lua Scripting Reference](./references/distributed-locks-and-lua-scripting.md)
- [Memory Optimization and Eviction Reference](./references/memory-optimization-and-eviction.md)
- [Hardened Redis Server Configuration](./resources/redis.hardened.conf)
- [Reentrant Lock Acquisition Lua Script](./resources/acquire_lock.lua)
- [Safe Atomic Lock Release Lua Script](./resources/release_lock.lua)
- [Distributed Lock Manager Context Implementation](./examples/distributed_lock_manager.py)
- [Sliding Window Rate Limiter Example](./examples/sliding_window_rate_limiter.py)
- [Cache Aside with Stampede Protection Example](./examples/cache_aside_with_stampede_protection.py)
