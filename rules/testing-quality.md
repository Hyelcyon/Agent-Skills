---
trigger: model_decision
description: "Apply when creating, modifying, debugging, or reviewing automated tests, test infrastructure, mocks, fixtures, regression tests, or build verification pipelines."
---

# Testing & Verification Quality Standards

This rule establishes mandatory engineering standards for automated testing, test isolation, determinism, mocking discipline, and empirical verification proof across all projects.

---

## 1. Test Observable Contracts, Not Implementation Details

- **Black-Box Boundary Testing**:
  - Assert against observable behavior, public API contracts, and state transformations.
  - Never test private methods, internal helper variables, or transient execution details. Tests that spy on private methods create brittle test suites that break during harmless refactorings.
- **Fail for the Right Reason**:
  - A test is only valuable if it fails when the behavior it protects is actually broken.
  - Assertions must verify meaningful outcomes. Avoid vague assertions like `expect(result).toBeDefined()`; verify exact return shapes, status codes, and error payloads:
    ```typescript
    // Correct: Asserting exact contract outcome
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: 'INVALID_EMAIL_FORMAT',
      message: 'The provided email domain is invalid',
    });
    ```

---

## 2. The Mini-SWE-Agent Issue Resolution & Verification Cycle

To achieve frontier benchmark reliability (>74% on SWE-bench verified) without complex wrapper bloat, the agent must strictly execute this deterministic 5-step operational cycle:

1. **Targeted Codebase Localization**:
   - Use precise search queries (`git grep`, exact symbol lookup, or specific stack trace files) to locate the defect's root cause.
   - Read only the files and functions directly involved in the data flow; avoid reading entire directories into context.
2. **Deterministic Defect Reproduction (RED)**:
   - Before modifying application logic, write a minimal reproduction script or standalone unit test (`repro.py`, `test_repro.ts`) that triggers the exact reported defect.
   - Execute the reproduction command via terminal and confirm that it fails with the expected error output.
3. **Minimal Surgical Edit (GREEN)**:
   - Make the smallest coherent code change directly addressing the root cause.
   - Strictly prohibit cosmetic renames, refactoring untouched methods, altering unrelated whitespace, or adding speculative "for later" helpers.
4. **Dual Verification Proof**:
   - Re-run the reproduction script and confirm it now cleanly passes (exit code 0).
   - Execute the project's existing test suite (`pytest`, `npm test`, `cargo test`, `python -m unittest`) to ensure zero regressions across existing functionality.
5. **Git Diff Review**:
   - Execute `git diff` and thoroughly review every modified line before reporting completion.
   - Confirm that zero temporary test files, console print debugging statements, or unintended file touches remain in the working tree.

---

## 3. Determinism, Clocks & Zero-Flake Policy

- **Strict Prohibition of Arbitrary Sleeps**:
  - Never use arbitrary `sleep()` or `setTimeout()` calls in test code (e.g. `await sleep(500)`).
  - Use condition-based polling with timeouts (`waitFor(() => expect(...))`) or explicit event/promise resolution.
- **Controlled Clocks & Seeded Randomness**:
  - Inject clock dependencies or use test runner fake timers (`vi.useFakeTimers()`, `sinon.useFakeTimers()`, `timecop`) to test scheduled jobs, timeouts, or TTL expirations instantly and deterministically.
  - Use fixed seeds or deterministic fixtures for data generators to ensure reproducible test runs.
- **Isolated State & Clean Teardown**:
  - Every test must be completely independent. Never rely on execution order or shared mutable global variables.
  - Clean up database rows, file system artifacts, and network listeners in `afterEach()` or `teardown()`.

---

## 4. Mocking Discipline: Prefer Fakes over Excessive Mocks

- **The Over-Mocking Anti-Pattern**:
  - Mocking internal domain classes creates false confidence: the test passes, but the real system fails in production due to contract drift.
  - Mock **only** at external out-of-process boundaries: third-party HTTP APIs, payment gateways, SMS/email services, and hardware drivers.
- **In-Memory Fakes over Complex Mock Objects**:
  - Prefer simple in-memory test doubles (e.g., `InMemoryUserRepository` implementing the domain interface) over intricate mock verification calls (`expect(repo.find).toHaveBeenCalledTimes(1)`).
  - Test real database queries using ephemeral test containers or in-memory databases whenever practical.

---

## 5. Edge Cases & Boundary Conditions

Test suites must intentionally probe non-happy-path behavior:
1. **Empty & Boundary Values**: Empty arrays, 0, negative values, max safe integers, empty strings, strings exceeding length limits.
2. **Invalid State Transitions**: Attempting to cancel an already-fulfilled order, duplicate registrations, expired tokens.
3. **Concurrency & Race Hazards**: Simultaneous requests attempting to debit a balance or claim a unique slug.
4. **Error Handling & Resource Cleanup**: Confirm that file descriptors, sockets, and transactions close cleanly on exception paths.

---

## 6. The Iron Law of Verification Evidence

- **No Completion Claims Without Execution Proof**:
  - Never claim a test suite passes, a build succeeds, or a bug is resolved based on theoretical speculation or previous runs.
  - Execute the actual command via terminal (`pnpm test`, `pytest`, `cargo test`, `mvn test`).
  - Read and verify the full output and confirm exit code `0`.
- **Reporting Standard**:
  - In response to the user, report the exact executed command line, the count of passed/failed tests, and any environmental constraints.

---

## 7. Testing Skills Dispatch

When configuring complex test runners, CI matrices, or mocking harnesses:
- **CI/CD Pipeline Matrix Testing**: Activate [`skills/engineering/cloud/ci-cd`](../skills/engineering/cloud/ci-cd/SKILL.md).
- **Dockerized Integration Testing**: Activate [`skills/engineering/cloud/docker`](../skills/engineering/cloud/docker/SKILL.md).
- **Node.js Native Test Runner & Strip**: Activate [`skills/engineering/web/backend/nodejs`](../skills/engineering/web/backend/nodejs/SKILL.md).

