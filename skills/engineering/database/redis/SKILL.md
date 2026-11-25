---
name: redis
description: Use when authoring, optimizing, or auditing Redis (v7.0 - v7.4+) architectures, designing caching strategies (Cache-Aside, Write-Through), mitigating cache stampedes, implementing distributed locks with Lua atomicity, or managing Redis Streams and eviction policies.
---

# Enterprise Redis Architecture Standard

This skill establishes the production standard for in-memory data storage, caching, distributed coordination, and event streaming using Redis (v7.0+). It enforces sub-millisecond execution, atomic operations, cache stampede mitigation, and strict memory safety.

---

## 1. Senior Engineering Craftsmanship & Domain Invariants

- **Root-Cause Tracing**: Inspect `INFO memory`, `SLOWLOG GET`, `CLUSTER SLOTS`, and lock ownership traces before modifying TTLs, eviction policies, or Lua scripts.
- **Minimal Surgical Diff**: Fix atomicity, key slot routing, or TTL bugs in place without adding unnecessary client wrappers.
- **Failing-First Repro**: Reproduce lock races, cache stampedes, or `CROSSSLOT` Cluster failures in a minimal script/unit test against fakes or a local instance before patching.
- **Non-Blocking Verification**: Validate keyspaces via throttled `SCAN`/`--bigkeys -i 0.1` and `SLOWLOG`, never `KEYS *` or blocking commands.

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
5. **Jittered Expirations**: Never set identical fixed TTLs on mass-inserted batch keys. Add random jitter (e.g., $TTL \pm 10\%$, clamped to $\ge 1\text{s}$) to prevent Cache Avalanche.

---

## 2. Fatal Mistakes Never to Make

| Anti-Pattern | Operational Risk | Production Remedy |
| :--- | :--- | :--- |
| `KEYS *` in production | Freezes the single-threaded engine; drops all client connections | Use non-blocking `SCAN <cursor> MATCH <pattern> COUNT 100` |
| Releasing distributed lock via `DEL` | Race condition deletes a lock re-acquired by another worker | Release only via token-matching atomic Lua script |
| Multi-key Lua/pipeline without `{hash_tag}` | Fails with `CROSSSLOT` errors in Redis Cluster | Wrap shared slot key segments in `{entity:id}` braces and pass all keys via `KEYS[]` |
| Hardcoding keys inside Lua scripts | Breaks Redis Cluster slot routing and static dependency analysis | Pass every accessed key exclusively via `KEYS[1..N]` |
| Caching without TTL or unclamped jitter (`ex <= 0`) | Silent OOM leaks or `ERR invalid expire time` crashes | Enforce positive jittered TTLs (`max(1, ttl + jitter)`) |
| Unbounded `HGETALL` on large hashes | Network buffer saturation and latency spikes | Restrict hash field sizes or read selectively via `HMGET` / `HSCAN` |
| Bare `MGET` across hundreds of thousands of keys | Monopolizes engine processing time | Chunk multi-key operations into batches of 100-500 keys (per slot in Cluster) |
| Legacy `rename-command` on Redis 7+ without ACLs | Deprecated in Redis 7+; weakens least-privilege auditing | Enforce Redis 7+ ACL rules (`+@all -@dangerous`) and disable unauthenticated `default` |
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
Adopt structured colon-separated hierarchical namespacing; in Redis Cluster, wrap shared multi-key prefixes in `{hash_tag}` braces so multi-key Lua scripts hit the same hash slot:
```
<env>:<service>:{<entity>:<id>}:<attribute>
prod:orders:{checkout:99481}:lock
```

### Phase 3: Deterministic Data Structure & Script Design
Execute atomic multi-operation logic using preloaded SHA1 Lua scripts (`$SCRIPT_SHA = ...` in PowerShell, `SCRIPT_SHA=$(...)` in Bash):
```bash
# bash
SCRIPT_SHA=$(redis-cli SCRIPT LOAD "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end")
redis-cli EVALSHA "$SCRIPT_SHA" 1 "prod:orders:{checkout:99481}:lock" "worker-token-xyz"
```

### Phase 4: Concurrency & Lock Auditing
Acquire distributed lock atomically:
```bash
# Atomic acquire: Key, Token, NX (only if not exists), PX (millisecond TTL)
redis-cli SET "prod:orders:{checkout:99481}:lock" "uuid-token-848" NX PX 30000
```

### Phase 5: Latency Proof & Slowlog Verification
Audit latency percentiles from client perspective (throttle `--bigkeys -i 0.1` or target a replica to avoid starving primaries):
```bash
redis-cli --latency-history -i 5
redis-cli --bigkeys -i 0.1
```

---

## 4. Deep References & Production Assets

- [Caching Patterns and Stampede Defense Reference](./references/caching-patterns-and-stampede-defense.md)
- [Distributed Locks and Lua Scripting Reference](./references/distributed-locks-and-lua-scripting.md)
- [Memory Optimization and Eviction Reference](./references/memory-optimization-and-eviction.md)
- [Hardened Redis Server Configuration](./resources/redis.hardened.conf)
- [Idempotent Lease-Extending Lock Acquisition Lua Script](./resources/acquire_lock.lua)
- [Safe Atomic Lock Release Lua Script](./resources/release_lock.lua)
- [Distributed Lock Manager Context Implementation](./examples/distributed_lock_manager.py)
- [Sliding Window Rate Limiter Example](./examples/sliding_window_rate_limiter.py)
- [Cache Aside with Stampede Protection Example](./examples/cache_aside_with_stampede_protection.py)
