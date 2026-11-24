# Antigravity Skills Progressive Disclosure Architecture

Architectural principles for structuring agent skills using a three-tier progressive disclosure model to eliminate LLM context window pollution and prevent reasoning degradation.

## 1. The Context Saturation Problem

When an AI agent loads massive monolithic instruction manuals into its context window, several failure modes occur:
1. **Attention Dilution**: Crucial constraints get lost among thousands of tokens of peripheral documentation ("lost in the middle" phenomenon).
2. **Context Bloat & Latency**: Large prompts slow down model inference and consume excessive token quotas.
3. **Instruction Confusion**: Conflicting edge-case examples from different frameworks confuse the model's active task scope.

---

## 2. The Three-Tier Progressive Disclosure Model

Antigravity skills solve context saturation by partitioning knowledge into three progressive tiers:

```
Tier 1: Discovery Metadata (name & description in YAML frontmatter)
        Loaded globally at agent initialization (~50 tokens per skill)
        │
        ▼ (Triggered only when user prompt matches skill intent)
Tier 2: Core Operational Protocol (SKILL.md, < 180 lines)
        Concise workflow phases, high-level invariants, clickable links
        │
        ▼ (Loaded selectively only when specific phase requires deep data)
Tier 3: Modular Deep Knowledge (references/, examples/, resources/)
        Specialized topic documents, runnable code samples, starter configs
```

---

## 3. Tier 1: Discovery Metadata Invariants

The YAML frontmatter must provide a high-signal description with explicit trigger terms and anti-triggers:

```yaml
---
name: nextjs
description: Use when building or reviewing Next.js 15+ web applications, App Router layouts, React Server Components (RSC), Server Actions, Partial Prerendering (PPR), or next/image optimization. Do NOT use for static Vite SPAs.
---
```

A well-crafted description enables the agent harness to route queries accurately without loading the file body.

---

## 4. Tier 2: SKILL.md Operational Structure

The `SKILL.md` body acts as the mission controller:
- Outlines the 5-Phase Agent Operational Protocol (Discovery, Architecture, Implementation, Quality, Delivery).
- Imposes strict, non-negotiable architectural boundaries.
- Links out to modular Tier 3 files via relative paths (e.g. `[references/topic.md](./references/topic.md)`).
- Remains strictly under 180 lines of markdown.

---

## 5. Tier 3: Granular Modularization

Tier 3 files are modularized so an agent reads only what is necessary:
- **`references/`**: Topic-focused architectural standards ($\ge 3$ files for standard engineering skills, $\ge 7$ for major platforms).
- **`examples/`**: Verified, production-grade implementation code ($\ge 3$ files).
- **`resources/`**: Reusable configuration templates, linters, schemas ($\ge 3$ files).
