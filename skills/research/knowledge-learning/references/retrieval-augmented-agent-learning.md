# Retrieval-Augmented Agent Continuous Learning

This reference explains how autonomous coding agents discover, hydrate, and apply learned workspace knowledge during runtime turns without exceeding context token budgets.

---

## 1. The Context Hydration Dilemma

Loading every single past insight, bugfix post-mortem, and user preference into the initial system prompt leads to:
- Severe prompt token bloat (degrading reasoning and inflating latency).
- Attention dilution (the model misses critical user instructions among dozens of irrelevant notes).
- Outdated instruction conflicts (old workarounds overriding newer codebases).

To solve this, continuous learning in Google Antigravity uses **Progressive Hydration**.

---

## 2. Progressive Hydration Architecture

```
[User Request Received]
         │
         ▼
[Step 1: Lightweight Trigger Match] ──> Query knowledge.json (scope & weight filtering)
         │
         ▼ (Matching Scope Detected)
[Step 2: On-Demand Card Hydration]  ──> Read specific cards/KC-xxx.md file
         │
         ▼
[Step 3: Plan Formulation]          ──> Incorporate verified invariant into plan
         │
         ▼
[Step 4: Surgical Execution]        ──> Execute using learned pattern
```

### Stage 1: Lightweight Trigger Matching
The agent checks only the machine-readable registry (`knowledge.json`) for path or keyword matches relevant to the user request. Cards with weight `critical` or matching `scope` are prioritized.

### Stage 2: Selective Deep Retrieval
If and only if the current task touches a known boundary (e.g. modifying `packages/auth` or running `pnpm test`), the agent reads the corresponding atomic knowledge card from `cards/KC-xxx.md`.

### Stage 3: Operational Invariant Enforcement
The agent incorporates the learned constraint directly into its reasoning:
- "Per KC-001 (critical), tests must be executed with pnpm test:native to synchronize native bindings."
- "Per KC-002 (high), integration tests require synchronizing WSL2 system clock via hwclock -s."

---

## 3. Resolving Conflicts Between Prior Learnings and User Prompt

When a user's prompt appears to contradict a stored knowledge card:
1. **Explicit Prompt Takes Precedence**: The user's active, in-session instruction always overrides historical knowledge.
2. **Flag Discrepancy Neutrally**: If the change will cause an error known from a past post-mortem, state the risk clearly:
   - "Previously in KC-001, running vitest directly caused silent native binding drift. Proceeding with the requested command."
3. **Capture New Learning**: If the user confirms that the architecture has changed, update `knowledge.json` and the corresponding card immediately to reflect the new state.
