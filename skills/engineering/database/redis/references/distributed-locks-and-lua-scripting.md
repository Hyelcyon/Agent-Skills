# Distributed Locks, Mutex Safety, and Atomic Lua Scripting

This document outlines distributed locking protocols, token validation invariants, lease renewal heartbeats, and transactional Lua scripting in Redis.

---

## 1. The Distributed Lock Correctness Invariant

A naive lock implementation:
```bash
# NAIVE & BROKEN
SETNX lock:order:100 "locked"
# ... do work ...
DEL lock:order:100
```
This fails catastrophically under production conditions:
1. If the worker crashes before `DEL`, the lock is held forever (deadlock).
2. If `EXPIRE` is set separately, a crash between `SETNX` and `EXPIRE` causes a permanent deadlock.
3. If Worker A's work takes longer than the lock TTL (e.g. JVM GC pause or database latency), the lock expires. Worker B acquires the lock. Worker A finishes and calls `DEL lock:order:100`, accidentally deleting Worker B's lock! Worker C now acquires the lock, resulting in two concurrent workers mutating shared state simultaneously.

---

## 2. The Canonical Correct Locking Algorithm

```
Worker A                                              Worker B
   |                                                     |
   +---> SET key token_A NX PX 30000                     |
   |     (Acquires lock with unique token_A)             |
   |                                                     |
   |  [Long GC pause or slow I/O: 35s]                   |
   |  Lock expires automatically in Redis                |
   |                                                     |
   |                                                     +---> SET key token_B NX PX 30000
   |                                                     |     (Acquires lock with token_B)
   |                                                     |
   +---> Release Lock via Lua Script                     |
   |     Lua checks: GET key == token_A?                 |
   |     (Value is token_B, NOT token_A!)                |
   |     Lua returns 0 (Delete ABORTED)                  |
   |                                                     |     Worker B retains lock!
                                                         v
```

### 2.1 Atomic Acquisition
```redis
SET lock:invoice:4092 "a9f8e4b2-0c91-4d32-9b21" NX PX 30000
```
- `NX`: Set only if key does not exist.
- `PX 30000`: Set expiry to 30,000 milliseconds (30 seconds).

### 2.2 Atomic Release Script
```lua
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
```
Executing this inside an atomic Lua script guarantees that no context switch or race condition can occur between the identity check and the deletion.

---

## 3. Lua Scripting Invariants in Redis

1. **Transactional Isolation**: Lua scripts execute atomically. While a script is running, no other command can execute on that Redis shard.
2. **Deterministic Inputs**: Keys accessed by the script MUST be passed via the `KEYS` array (not hardcoded inside the script text) so that Redis Cluster routers can verify that all keys map to the same hash slot.
3. **Execution Time Limits**: Scripts should execute within sub-millisecond durations. Long-running Lua scripts block the entire engine, causing `BUSY Redis is busy running a script` errors.
