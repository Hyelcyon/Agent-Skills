# Example: Debugging Post-Mortem to Knowledge Distillation

This example illustrates distilling a multi-hour silent failure debugging session into a reusable knowledge card.

---

## 1. Scenario: Silent Redis Lock Timeout in Test Environment

During integration testing, a distributed locking test suite intermittently timed out after 60 seconds with no stack trace or error log.

---

## 2. Investigation and Root Cause Discovery

1. **Initial symptom**: Test worker hung indefinitely on Redis key acquisition.
2. **Empirical test**: Running with Redis monitor revealed that `SET ... NX PX` succeeded, but the subsequent unlock script failed silently because the test container clock had drifted by 35 seconds relative to the Windows host WSL environment.
3. **Fix**: Synchronizing WSL clock with Windows host via `hwclock -s` resolved the hang completely.

---

## 3. Knowledge Card Creation

The agent generates `.gemini/knowledge/KC-022-wsl2-clock-drift-redis.md`:

```markdown
# Knowledge Card: WSL2 Clock Drift Causing Redis Lock Expiry Failures

- **Card ID**: KC-022
- **Category**: environment
- **Scope**: tests/integration/distributed-lock.spec.ts
- **Created**: 2026-11-03
- **Last Verified**: 2026-11-03
- **Status**: Active

## 1. Problem Context & Symptoms
Integration tests testing TTL-based Redis locks hang indefinitely or fail assertions sporadically on Windows/WSL2 workstations. Redis monitor shows locks instantly expiring or already expired upon acquisition.

## 2. Root Cause
WSL2 virtual machines experience hardware clock drift after Windows sleep/wake cycles. Millisecond-precision Redis lock TTLs calculate negative or zero durations immediately upon evaluation.

## 3. Mandatory Invariant
Before executing integration tests that rely on time-sensitive Redis or PostgreSQL locks on WSL2, execute a hardware clock synchronization check.

```bash
sudo hwclock -s
```

- ❌ Assuming system time is monotonic across Windows host sleep cycles in WSL2.

## 4. Verification Proof
```bash
sudo hwclock -s && pnpm test:integration
```
```text
✓ test/distributed_lock.spec.ts (8 tests) 420ms
Test Files  1 passed (1)
Tests  8 passed (8)
```
```
