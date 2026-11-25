# Example: Debugging Post-Mortem to Knowledge Distillation

This example illustrates distilling a multi-hour silent failure debugging session into an atomic knowledge card and registering it in `knowledge.json`.

---

## 1. Scenario: Silent Redis Lock Timeout in Test Environment

During integration testing, a distributed locking test suite intermittently timed out after 60 seconds with no stack trace or error log.

---

## 2. Investigation and Root Cause Discovery

1. **Initial symptom**: Test worker hung indefinitely on Redis key acquisition.
2. **Empirical test**: Running with Redis monitor revealed that `SET ... NX PX` succeeded, but the subsequent unlock script failed silently because the WSL2 VM clock had drifted by 35 seconds behind the Windows host clock.
3. **Fix**: Synchronizing the WSL2 system clock from the Windows hardware clock via `sudo hwclock -s` resolved the lock expiry discrepancy.

---

## 3. Knowledge Card Creation

The agent writes `.gemini/knowledge/cards/KC-022-wsl2-clock-drift-redis.md`:

````markdown
# Knowledge Card: WSL2 Clock Drift Causing Redis Lock Expiry Failures

- **Card ID**: KC-022
- **Category**: environment
- **Weight**: high
- **Scope**: tests/integration/distributed-lock.spec.ts
- **Created**: 2026-11-03
- **Last Verified**: 2026-11-03
- **Status**: Active

## 1. Problem Context & Symptoms
Integration tests exercising TTL-based Redis locks hang or fail assertions sporadically on Windows/WSL2 workstations. Redis monitor shows keys expiring immediately upon acquisition.

## 2. Root Cause
WSL2 virtual machines can experience clock drift relative to the Windows host after sleep/wake cycles. Millisecond-precision Redis lock TTL comparisons against host timestamps calculate stale expiries immediately.

## 3. Mandatory Invariant
Before executing time-sensitive Redis or PostgreSQL lock integration tests inside WSL2, synchronize the guest clock first.

```bash
sudo hwclock -s
```

- ❌ Assuming guest system time stays synchronized across Windows host sleep cycles in WSL2.

## 4. Verification Proof
```bash
sudo hwclock -s && pnpm test:integration
```
```text
✓ tests/integration/distributed-lock.spec.ts (8 tests) 420ms
Test Files  1 passed (1)
Tests  8 passed (8)
```
````

---

## 4. Registry Synchronization (`knowledge.json`)

Register the new card in `.gemini/knowledge/knowledge.json`:

```json
{
  "id": "KC-022",
  "title": "WSL2 Clock Drift Causing Redis Lock Expiry Failures",
  "category": "environment",
  "scope": "tests/integration/distributed-lock.spec.ts",
  "weight": "high",
  "status": "Active",
  "path": "cards/KC-022-wsl2-clock-drift-redis.md",
  "summary": "Run sudo hwclock -s inside WSL2 before time-sensitive Redis lock integration tests.",
  "created_at": "2026-11-03",
  "last_verified": "2026-11-03",
  "verification_command": "sudo hwclock -s && pnpm test:integration"
}
```
