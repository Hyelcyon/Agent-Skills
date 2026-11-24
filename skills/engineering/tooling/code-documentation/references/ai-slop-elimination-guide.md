# AI Slop Elimination Guide: Code Comments & Technical Documentation

A principal engineering manual on identifying, purging, and replacing generative language model filler ("AI Slop") in source code comments and technical documentation with high-signal, rigorous craftsmanship.

---

## 1. The Root Cause of AI Slop

Generative language models produce "AI Slop" because autoregressive next-token prediction inherently optimizes for plausible generic phrasing, conversational pleasantries, and literal syntactic restatement:
1. **Low-Risk Hallucination Avoidance**: Rather than deducing non-obvious invariants or system limits, models repeat what is visibly syntax (`// parse json` above `JSON.parse()`).
2. **Conversational Sycophancy**: Models copy marketing hype ("seamlessly", "cutting-edge", "empowers") and polite padding ("Welcome to...", "Happy coding!").
3. **Triad & List Compulsion**: Models generate bulleted laundry lists of generic virtues ("Scalable, Secure, Robust") that lack any measurable SLA, concrete threshold, or verified parameter.

---

## 2. Part 1: Code Commenting Anti-Slop Standards

### Archetype 1: The Echo Parrot (코드 앵무새)
Restating visible syntax in natural language.

#### ❌ AI Slop
```typescript
// Loop over each item in the array
for (const item of items) {
  // Check if the item is active
  if (item.isActive) {
    // Add the item to active items
    activeItems.push(item);
  }
}
```

#### ✅ Senior Standard
Delete the comments. The syntax is already self-documenting. If logic is complex, express it via functional filter:
```typescript
const activeItems = items.filter((item) => item.isActive);
```

---

### Archetype 2: The Category Billboard (카테고리 현수막)
Injecting decorative separator lines and categorization banners.

#### ❌ AI Slop
```python
# ==========================================
# CONSTANTS & CONFIGURATION
# ==========================================
DEFAULT_TIMEOUT_MS = 5000

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def calculate_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()
```

#### ✅ Senior Standard
Delete banners. Module cohesion, concise files, and explicit exports communicate structure without visual noise.

---

### Archetype 3: The Changelog Tombstone (유물 기록)
Embedding AI session provenance, issue IDs, or diff narratives inside source code.

#### ❌ AI Slop
```rust
// Added by AI Assistant to fix bug in PR #104
// Previous code had an off-by-one error when capacity was zero
let capacity = std::cmp::max(1, requested_capacity);
```

#### ✅ Senior Standard
Comments must describe timeless invariants. Git history (`git blame`, conventional commits) tracks "who/when/why":
```rust
// Capacity must be strictly non-zero to prevent division-by-zero panics in the ring buffer indexer.
let capacity = std::cmp::max(1, requested_capacity);
```

---

### Archetype 4: The Trivial Param Echo (매개변수 단순 복사)
Docstrings that merely repeat parameter and return types without semantic value.

#### ❌ AI Slop
```typescript
/**
 * Fetches user by ID.
 * @param id - The ID of the user.
 * @param tenant - The tenant object.
 * @returns The user object.
 */
async function getUser(id: string, tenant: Tenant): Promise<User> {
  return await db.users.find(id);
}
```

#### ✅ Senior Standard
Document domain constraints, nullability, partitioning rules, and thrown errors:
```typescript
/**
 * Hydrates a user entity within a verified tenant isolation boundary.
 *
 * @param id - Canonical UUIDv7 identifier.
 * @param tenant - Active tenant context determining partition routing.
 * @returns Hydrated user record, or null if deleted or marked inactive.
 * @throws {TenantPartitionMismatchError} If `id` belongs to an external tenant shard.
 */
async function getUser(id: string, tenant: Tenant): Promise<User | null> {
  return await db.users.find(id);
}
```

---

### Archetype 5: The Speculative Hand-Waving (막연한 유보)
Writing lazy warnings or speculative TODOs instead of engineering deterministic solutions.

#### ❌ AI Slop
```python
# Handle error here if something goes wrong
try:
    response = fetch_telemetry()
except Exception:
    pass
```

#### ✅ Senior Standard
Enforce explicit error boundaries with structured context:
```python
try:
    response = fetch_telemetry()
except DownstreamTimeoutError as err:
    logger.warning("Downstream telemetry timeout; falling back to cached baseline", exc_info=err)
    response = get_cached_telemetry_snapshot()
```

---

## 3. Part 2: Technical Documentation Anti-Slop Standards

### The 5 Archetypes of AI Slop in Documentation

#### Archetype 1: The Grandiose Throat-Clearing (거창한 서두)
- ❌ **AI Slop:**
  > *"In today's fast-paced digital ecosystem, managing state and building distributed systems has become more crucial than ever before. Welcome to NexusCore! NexusCore is an innovative, state-of-the-art framework designed to empower engineers to seamlessly build next-generation applications..."*
- ✅ **Senior Standard:**
  Start Line 1 with the concrete technical contract:
  > *"NexusCore is an in-memory distributed raft-consensus key-value store targeting $\le 5\text{ms}$ write latency at p99 across 3-node clusters."*

#### Archetype 2: The Marketing Adjective Deluge (형용사 범람)
- ❌ **AI Slop:**
  > *"Our cutting-edge pipeline effortlessly streamlines data ingestion with a rich tapestry of powerful, game-changing features."*
- ✅ **Senior Standard:**
  Replace adjectives with verified parameters:
  > *"Ingestion pipeline sustains $100{,}000\text{ spans/sec}$ under a $512\text{MB}$ memory budget, writing snappy-compressed Parquet files directly to S3."*

#### Archetype 3: The Content-Free Laundry List (알맹이 없는 나열)
- ❌ **AI Slop:**
  > - **High Performance**: Built from the ground up for maximum speed.
  > - **Secure**: Enterprise-grade security out of the box.
  > - **Scalable**: Seamlessly scales as your business grows.
  > - **Reliable**: Designed for maximum uptime and reliability.
- ✅ **Senior Standard:**
  Define concrete engineering choices, architectures, and SLAs:
  > - **Throughput SLA**: $50{,}000\text{ RPS}$ per worker instance with $p99 < 15\text{ms}$.
  > - **Storage Engine**: RocksDB with direct I/O and block cache capped at $2\text{GB}$.
  > - **Consistency Model**: Linearizable reads via Raft leases; dirty reads rejected.
  > - **Authentication**: Mutual TLS (mTLS) with SPIFFE X.509 SVID identity validation.

#### Archetype 4: The Circular Definition (동어반복 정의)
- ❌ **AI Slop:**
  > - `PaymentService`: A service that handles payment processing in the application.
  > - `AuditManager`: Manages the auditing functionality.
- ✅ **Senior Standard:**
  Detail state transitions, idempotency guarantees, and rollback invariants:
  > - `PaymentService`: Orchestrates ledger debit/credit reservations using two-phase commit over PostgreSQL Transactional Outbox. Guarantees exactly-once settlement via `Idempotency-Key` header with 24-hour Redis TTL.
  > - `AuditManager`: Appends immutable hash-chained audit records to append-only ledger partitions; rejects in-place updates.

#### Archetype 5: The Sycophantic Outro (작위적 마무리)
- ❌ **AI Slop:**
  > *"Congratulations! You have now unlocked the full potential of NexusCore! Happy coding! If you have any questions or feedback, feel free to reach out to our team!"*
- ✅ **Senior Standard:**
  Provide an actionable Operational Runbook / Troubleshooting Matrix:
  > ### Troubleshooting & Operational Runbook
  > | Symptom | Diagnostic Probe | Root Cause | Remediation |
  > | :--- | :--- | :--- | :--- |
  > | `504 Gateway Timeout` | `curl -s localhost:9090/metrics \| grep queue_depth` | Ring buffer saturation ($> 50{,}000$ pending events) | Scale worker replicas or adjust downstream consumer batch size. |
  > | `409 Conflict` | Check `pg_stat_activity` for transaction locks | Concurrent requests sharing identical `Idempotency-Key` | Client must retry after backoff or await primary settlement webhook. |

---

## 4. The 6 Mandatory Pillars of Senior Technical Documentation

Every technical specification, architecture design document, or repository README must fulfill these 6 pillars:

1. **Executive System Contract**: A 1-2 sentence definition of the exact technical boundary, consumers, and operational scope.
2. **System Invariants & SLAs**: Concrete numerical throughput, latency percentiles ($p50/p99$), memory caps, and durability targets.
3. **Architecture Topology**: Strict ASCII or Mermaid diagrams visualizing data flows, trust boundaries, and persistence engines.
4. **Deterministic Quickstart**: Copy-pasteable CLI commands with verified flags, expected terminal outputs, and zero omitted prerequisites.
5. **Architectural Decision Record (ADR) Matrix**:
   - **Context**: The concrete engineering problem.
   - **Decision**: The selected architecture or library.
   - **Consequences**: Technical trade-offs accepted.
   - **Rejected Alternatives**: Explicitly named alternatives and why they were discarded (e.g. *"Why gRPC was chosen over REST; why SQLite was rejected in favor of PostgreSQL"*).
6. **Failure Modes & Operational Runbook**: Explicit mapping of failure symptoms to root causes and remediation actions.
