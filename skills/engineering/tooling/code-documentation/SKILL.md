---
name: code-documentation
description: Use when authoring source code comments, writing TSDoc or Python docstrings, documenting module interfaces and invariants, or removing noisy redundant comments.
---

# Senior Code Documentation & Commenting Architecture

Senior engineering runbook for authoring high-signal, architectural code comments, interface contracts, and module documentation while eliminating superficial line-by-line code narration.

## When to Use
- Documenting public API interfaces, classes, and exported modules across TypeScript, Python, or Rust.
- Capturing non-obvious invariants, concurrency locks, time complexity trade-offs, or third-party bug workarounds.
- Refactoring legacy codebases to strip out redundant, junior-level comments that paraphrase code.
- Applying TSDoc, Google-Style Python docstrings, or Rustdoc standards to shared libraries.

## When NOT to Use
- Renaming variables or functions to improve readability before considering comments (refactor first).
- Writing external end-user guides, READMEs, or PR descriptions (use `github`).

---

## 1. Autonomous Agent Operational Protocol

When adding, reviewing, or refactoring comments in code, the agent must execute these 5 sequential phases:

```
[Phase 1: Code Clarification] ──> [Phase 2: Noise Elimination] ──> [Phase 3: Interface Contracts] ──> [Phase 4: Invariants & Rationale] ──> [Phase 5: Verification & Audit]
  Refactor names & functions      Strip superficial comments       Write TSDoc/Docstring boundaries    Document "Why" and constraints    Validate docstrings & 0 stale
```

### Phase 1: Code Clarification First
Before writing a comment to explain complicated code:
1. Ask: *Can this code be made obvious by renaming variables or extracting a helper function?*
2. If yes, refactor the code first. Comments must not compensate for obfuscated code.

### Phase 2: Noise Elimination (The "What" Purge)
Inspect existing or generated code and immediately remove comments that simply repeat the syntax:
- ❌ Strip `// loop over accounts` above `for account in accounts:`
- ❌ Strip `// set status to paid` above `order.status = 'PAID'`

### Phase 3: Interface Contracts at Module Boundaries
Every exported function, public method, and domain entity must have a formal docstring authored strictly in professional English:
- **TypeScript**: TSDoc block with summary, `@remarks` for architectural context, `@param`, `@returns`, and `@throws`.
- **Python**: Google-style docstring with `Args:`, `Returns:`, and `Raises:`.
- **Rust**: Rustdoc `///` block with `# Invariants`, `# Errors`, and `# Panics`.

### Phase 4: Capture Invariants, Trade-Offs & "Why"
Document the non-obvious reasoning (always in concise English) that cannot be deduced from the syntax alone:
- **Concurrency**: State why a specific mutex acquisition order is enforced to prevent deadlocks.
- **Security**: State why a regex is written with atomic groupings to prevent catastrophic backtracking (ReDoS).
- **Workarounds**: Link issue numbers or explain browser/API quirks that justify unusual workarounds.

### Phase 5: Verification & Maintenance Gate
1. Validate documentation contracts and syntax across toolchains:
   - **TypeScript**: Validate TSDoc tags with `eslint-plugin-tsdoc` or TypeScript compiler checks.
   - **Python**: Check docstring conformance using `ruff check --select D`.
   - **Rust**: Run doc tests with `cargo test --doc`.
2. Inspect the final Git diff to verify that zero superficial/trivial inline comments or stale comments remain. Ensure comments match the exact surrounding code.

---

## 2. Senior Documentation Standards

### TSDoc Example (TypeScript)
```typescript
/**
 * Processes a financial transaction for a verified customer account.
 *
 * @remarks
 * Employs a distributed lock on the account key to prevent race conditions during concurrent webhooks.
 *
 * @param accountId - The immutable UUIDv4 identifying the customer.
 * @param amountCents - Positive integer representing the charge in smallest currency units.
 * @returns Finalized transaction record.
 * @throws {@link InsufficientFundsError} If settled balance is less than `amountCents`.
 */
```

### Google-Style Docstring Example (Python)
```python
def execute_with_jittered_retry(operation: Callable[[], T], max_attempts: int = 5) -> T:
    """Executes a callable with exponential backoff and randomized full jitter.

    Full jitter decorrelates concurrent retry attempts across worker threads,
    preventing thundering-herd spikes against struggling downstream services.

    Args:
        operation: A zero-argument callable representing the network operation.
        max_attempts: Maximum retry count before re-raising the last exception.

    Returns:
        The successful return value produced by `operation`.

    Raises:
        ValueError: If `max_attempts` is less than 1.
    """
```

---

## 3. Critical Anti-Patterns to Avoid
- ❌ AI Slop Comments: Paraphrasing syntax line-by-line (`// loop over items`), category banners (`// --- HELPERS ---`), or session tombstoning.
- ❌ AI Slop Documentation: Throat-clearing openers (*"In today's fast-paced..."*), marketing puffery (*"seamlessly"*, *"cutting-edge"*), and generic content-free laundry lists.
- ❌ Authoring comments, docstrings, or code identifiers in non-English languages (degrades readability and tool interoperability).
- ❌ Committing commented-out code blocks (`// oldImplementation()`).
- ❌ Leaving stale comments after modifying function parameters or return values.
- ❌ Writing vague comments like `// hack` or `// fix later` without explaining the root cause.

## References & Documentation
- AI Slop Elimination Guide: [references/ai-slop-elimination-guide.md](./references/ai-slop-elimination-guide.md)
- Ousterhout's Commenting Philosophy: [references/ousterhout-comment-philosophy.md](./references/ousterhout-comment-philosophy.md)
- Senior vs Junior Comments Comparison: [references/senior-vs-junior-comments.md](./references/senior-vs-junior-comments.md)
- Docstring Contracts & Invariants: [references/docstring-contracts-and-invariants.md](./references/docstring-contracts-and-invariants.md)

## Resources & Examples
- TSDoc Standard Template: [resources/tsdoc-template.ts](./resources/tsdoc-template.ts)
- Python Docstring Template: [resources/python-docstring-template.py](./resources/python-docstring-template.py)
- Rustdoc Standard Template: [resources/rustdoc-template.rs](./resources/rustdoc-template.rs)
- Documented Token Bucket Example: [examples/token_bucket_documented.ts](./examples/token_bucket_documented.ts)
- Documented Resilient Retry Example: [examples/resilient_retry_documented.py](./examples/resilient_retry_documented.py)
- Documented Rust Ring Buffer Example: [examples/documented_rust_channel.rs](./examples/documented_rust_channel.rs)
