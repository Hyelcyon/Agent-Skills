# Tech-Debt Triage Matrix

Prioritize maintenance work strictly by risk and blast radius rather than aesthetic preference:

| Priority | Condition | Action |
| :--- | :--- | :--- |
| **P0 (Fix Immediately)** | Active security CVE, silent data loss, broken CI, or race condition | Isolate root cause, add regression test, fix now |
| **P1 (Fix on Touch)** | Brittle module without tests, high-churn duplication (`>= 3` callers), deprecated API blocking next LTS | Add characterization tests, refactor within touched boundary |
| **P2 (Schedule Separately)** | Minor naming drift, style inconsistency, non-urgent major version lag | Log cleanly; never mix into unrelated bugfix diffs |
| **Delete** | Verified unreachable code, stale commented-out blocks, unused dependencies | Verify zero dynamic/CLI/export refs, then delete outright |
