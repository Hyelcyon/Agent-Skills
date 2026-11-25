# Antigravity Skills Progressive Disclosure Architecture

Architectural guide for structuring Antigravity Desktop App skills across three progressive loading tiers so the context window stays sharp and free of instruction dilution.

---

## 1. Why Context Saturation Breaks Agents

Loading monolithic runbooks triggers three failures:
1. **Attention Dilution ("Lost in the Middle")**: Non-negotiable invariants and security boundaries get buried under verbose tutorials.
2. **Startup Token Tax**: Every discovered skill's frontmatter `name` and `description` loads at session startup; bloated descriptions slow routing across 50+ skills.
3. **Cross-Framework Bleed**: Mixing unrelated sub-domains (e.g., build tooling + database locking) inside one `SKILL.md` increases hallucinated imports and incompatible APIs.

---

## 2. Three-Tier Progressive Loading + Black-Box Execution

```text
Tier 1: Startup Discovery Index (~30-100 tokens/skill)
        Reads ONLY YAML frontmatter (name + description).
        │
        ▼ (Activated when prompt matches triggers / not excluded by anti-triggers)
Tier 2: Operational Controller (SKILL.md, concise < 180 lines)
        Core "When to Use", Fatal Mistakes, 5-Phase Workflow, Verification Gate, Links.
        │
        ▼ (Hydrated on-demand when hitting a specific branch)
Tier 3: Deep Reference / Assets / Black-Box Scripts
        - references/*.md   -> read selectively per sub-problem
        - resources/*       -> read before scaffolding config/manifests
        - examples/*        -> read before generating tricky concurrency/security code
        - scripts/*         -> run with `--help` via terminal; read source ONLY to patch
```

---

## 3. Tier Design Rules

### Tier 1 (`name` & `description`)
- `description` must remain concise (`<= 1024` chars, ideally `100..260` chars), listing exact file names, framework versions, error symptoms, and sibling exclusions.
- Either `"Use when ..."` (workstation catalog convention) or clear third-person `"Audits ... Use when ..."` satisfies Antigravity routing; **never summarize procedural steps** in `description`.

### Tier 2 (`SKILL.md`)
- Must state concrete activation boundaries, **Fatal Mistakes Never to Make**, an actionable workflow, verifiable proof criteria, and relative links (`[references/topic.md](./references/topic.md)`) to Tier 3 assets.
- Do NOT instruct the agent to "read all files in `references/` upfront".

### Tier 3 (`references/`, `examples/`, `resources/`, `scripts/`)
- Link every Tier 3 document explicitly from `SKILL.md` so discovery is deterministic and verifiable by link checkers.
- Keep `SKILL.md` body self-contained enough to prevent dangerous mistakes even before Tier 3 is hydrated.
- Execute `scripts/` tools via terminal (`--help` first) rather than wasting context reading 200 lines of helper code just to run an audit.
