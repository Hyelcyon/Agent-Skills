# Knowledge Extraction and Distillation

This reference guide establishes the operational protocol for identifying, extracting, and distilling non-obvious workspace knowledge, architectural constraints, and user corrections into high-density, persistent engineering assets.

---

## 1. The Need for Continuous Knowledge Distillation

Autonomous coding agents frequently encounter workspace-specific idiosyncrasies, private tooling, undocumented dependency quirks, and explicit user corrections. Without structured knowledge distillation:
- Future turns or new agent sessions repeat the same failed approaches.
- Corrected user preferences are forgotten once context windows reset.
- Complex debugging breakthroughs (e.g. root causes of race conditions, port conflicts, or build tool flags) are lost to session compaction.
- Ad-hoc notes clutter session transcripts instead of hardening workspace intelligence.

---

## 2. Signal vs Noise: What Deserves Persistence

Not every fact or observation qualifies as persistent workspace knowledge. Agents must evaluate observations against the **Knowledge Filter Quadrant**:

| Quadrant | Description | Action | Example |
| :--- | :--- | :--- | :--- |
| **A. Workspace Invariant** | Non-standard build flags, private registries, monorepo import constraints, port allocations. | **Mandatory Persistence** (Knowledge Card or Workspace Rule). | "This monorepo requires `pnpm --filter @core/api build` before running tests." |
| **B. User Correction** | Explicit feedback from the user regarding preferred libraries, formatting, architecture, or behavior. | **Mandatory Persistence** (Workspace Preferences or Rule). | "Never use Jest; always use `node:test` and native type stripping." |
| **C. Solved Edge-Case / Quirk** | Multi-step debugging resolution of an undocumented runtime or framework bug. | **Mandatory Persistence** (Post-Mortem Card). | "Docker volume mounts on Windows require explicit POSIX path mapping in `docker-compose.yml`." |
| **D. Transient / Ephemeral** | One-off typo, temporary network blip, standard library documentation already publicly available. | **Discard / Ignore** (Do NOT persist). | "React `useState` takes an initial value." |

---

## 3. The 4-Step Distillation Pipeline

```
[1. Signal Detection] ──> [2. Falsification] ──> [3. Atomization] ──> [4. Invariant Codification]
   Catch correction/bug      Verify against code      Format to atomic card     Write non-negotiable rule
```

### Step 1: Signal Detection
Detect high-value triggers:
- User correction: "Don't do X, we do Y in this repo."
- Command failure: A standard command fails due to environment-specific prerequisites.
- Silent bug: Code compiles but fails runtime assertions due to hidden configuration requirements.

### Step 2: Falsification & Evidence Verification
Before recording knowledge, the agent must verify the fact empirically:
- Is this reproducible, or was it a one-off anomaly?
- Can it be confirmed by inspecting `package.json`, `Makefile`, Git logs, or source code?
- Never codify assumptions; always confirm with a command run or verified file read.

### Step 3: Atomization into Self-Contained Knowledge Cards
Distill findings into an independent, single-topic card:
- **Scope**: Explicit path or domain boundaries where this knowledge applies.
- **Problem Statement**: What symptom or error occurs when this invariant is violated.
- **Root Cause**: The underlying technical mechanism.
- **Resolution / Invariant**: The exact command, pattern, or syntax to use.
- **Verification Proof**: Command output demonstrating the fix.

### Step 4: Invariant Codification
Translate the atomic card into a non-negotiable behavioral rule:
- If it applies workstation-wide, propose updating `AGENTS.md` or global rules (`~/.gemini/config/knowledge/knowledge.json` + `cards/`).
- If it applies to this project only, record it in `.gemini/knowledge/cards/` (indexed in `.gemini/knowledge/knowledge.json`) or project `AGENTS.md`.
- If it defines an architectural decision, codify an Architecture Decision Record (`docs/adr/ADR-NNNN.md`).
