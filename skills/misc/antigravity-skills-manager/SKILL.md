---
name: antigravity-skills-manager
description: Use when auditing, verifying, organizing, registering, or diagnosing Antigravity Desktop App skills and skills.json paths across workspace and global environments, fixing unindexed skills, or validating skill schemas.
---

# Antigravity Skills Manager

Operational runbook for managing, verifying, and optimizing Agent Skills in **Google Antigravity Desktop App** (`https://antigravity.google/docs/skills`, `https://antigravity.google/docs/customization-discovery`, and `https://agentskills.io/specification`).

## When to Use
- Auditing installed skills across Antigravity App workspace (`.agents/skills/`) and global (`~/.gemini/config/skills/`) discovery roots.
- Registering nested skill category directories in `skills.json` and `.agents/skills.json` (`entries`, `include_only`, `exclude`, `inherits`).
- Validating YAML frontmatter (`name` matching folder name, `<= 64` chars; `description` `10..1024` chars with triggers and anti-triggers), progressive disclosure budgets, and markdown links.
- Performing **manual side-by-side verification** of skill prose, API versions, security safety, and executable examples against live runtime tools and official docs.

## When NOT to Use
- Managing Anthropic Claude Code skills (use `claude-skills-manager` at [../claude-skills-manager/SKILL.md](../claude-skills-manager/SKILL.md)).
- Managing OpenAI Codex skills (`agents/openai.yaml`, `AGENTS.override.md`) (use `codex-skills-manager` at [../codex-skills-manager/SKILL.md](../codex-skills-manager/SKILL.md)).
- Enforcing always-on project rules or tool hooks (use `rules/`, `AGENTS.md`, or `.agents/hooks.json`).

---

## Fatal Mistakes Never to Make

- **Never apply CLI-only paths to Antigravity App**: Antigravity Desktop App discovers global skills from `~/.gemini/config/skills/` and workspace skills from `.agents/skills/` (legacy `.agent/skills/`) plus registered `skills.json` parents. Do NOT treat `~/.gemini/antigravity-cli/skills/` or `~/.gemini/skills/` as App discovery roots.
- **Never nest skills >1 level deep without `skills.json`**: Antigravity scans each configured skills root only **1 level deep** (`<root>/<skill-name>/SKILL.md`). Nested trees such as `skills/engineering/platform/<name>` stay invisible unless `skills/engineering/platform` is registered in `skills.json` / `.agents/skills.json`.
- **Never borrow Claude/Codex frontmatter into Antigravity skills**: Antigravity follows the open Agent Skills fields (`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`). Do NOT invent Claude keys (`context: fork`, `disable-model-invocation`, `!` dynamic injection) or Codex `agents/openai.yaml` metadata as Antigravity requirements.
- **Never pad empty or toy stub files to game quotas**: Antigravity only *requires* `SKILL.md`. When using this workstation's modular Triad convention (`references/`, `examples/`, `resources/`), every file must prevent a concrete bug or ambiguity. Stubs waste tokens and cause reasoning dilution.
- **Never confuse regex script output with manual technical review**: Automated scripts (`audit_skills.ps1`, `verify_skill_truth.py`) check structure and known regexes; they cannot catch logical concurrency races, deprecated Java/Angular/PromQL semantics, or insecure SSRF/cookie code. Always verify code and API claims manually side-by-side with official docs and real compilers.

---

## 5-Phase Agent Operational Protocol

```text
Phase 1: App Discovery & Manifest Parity (skills.json == .agents/skills.json)
Phase 2: Frontmatter & Official Spec Validation (name == dir, trigger description, <= 1024 chars)
Phase 3: Progressive Disclosure & Anti-Bloat Audit (concise SKILL.md, high-signal Triad)
Phase 4: Manual Side-by-Side Technical Truth + Black-Box Audit Scripts
Phase 5: Verified Evidence Report & Minimal Synchronization Diff
```

### Phase 1: Discovery Root & Manifest Parity
1. Verify workspace `.agents/skills.json` and root `skills.json` list every nested skill parent directory (e.g., `skills/engineering/platform`, `skills/misc`).
2. Remember: relative `path` entries inside `.agents/skills.json` resolve from the **workspace root** containing `.agents/`, not from inside `.agents/`.

### Phase 2: Frontmatter & Official Spec Validation
Validate against [resources/skill-frontmatter-schema.json](./resources/skill-frontmatter-schema.json):
- `name` is required, `1..64` chars, regex `^[a-z0-9]+(-[a-z0-9]+)*$`, and **matches its enclosing folder name**.
- `description` is required, `<= 1024` chars, states clear trigger symptoms/keywords (and `"Do NOT use for..."` boundaries where siblings overlap) **without summarizing multi-step workflows** (summaries cause models to skip reading `SKILL.md`).

### Phase 3: Progressive Disclosure & Senior Quality Review
Read [references/antigravity-skills-developer.md](./references/antigravity-skills-developer.md) and [references/skills-progressive-disclosure-model.md](./references/skills-progressive-disclosure-model.md):
- Keep `SKILL.md` concise and procedural (`< 180` lines in this workstation catalog; never monolithically inline bulky specs).
- Keep scripts deterministic and self-describing (`--help` first) so agents treat scripts as black-box tools without hydrating full script source unnecessarily.
- Ban AI-slop / syntax-echo comments while preserving shebangs and non-obvious invariant "why" comments.

### Phase 4: Verification (Manual + Deterministic Scripts)
Execute automated structural and syntax checks, then manually audit diffs with compilers/linters:
```powershell
powershell -ExecutionPolicy Bypass -File skills/misc/antigravity-skills-manager/scripts/audit_skills.ps1 -ConfigPath skills.json
powershell -ExecutionPolicy Bypass -File skills/misc/antigravity-skills-manager/scripts/audit_skills.ps1 -ConfigPath .agents/skills.json
python skills/misc/antigravity-skills-manager/scripts/verify_skill_truth.py
```

### Phase 5: Transparent Proof & Synchronization
Report exact command exit codes, manifest parity status, broken links (`0`), and any skills updated or flagged.

---

## References, Schemas & Examples
- Architecture & Antigravity Discovery Deep Dive: [references/antigravity-skills-developer.md](./references/antigravity-skills-developer.md)
- Progressive Disclosure Architecture: [references/skills-progressive-disclosure-model.md](./references/skills-progressive-disclosure-model.md)
- Authoring, Manual Audit & Testing Framework: [references/skills-authoring-and-testing-framework.md](./references/skills-authoring-and-testing-framework.md)
- Discovery Manifest Schema (`skills.json`): [resources/skills-schema.json](./resources/skills-schema.json)
- Frontmatter Schema (`SKILL.md`): [resources/skill-frontmatter-schema.json](./resources/skill-frontmatter-schema.json)
- Standard Skill Template: [resources/skill-template.md](./resources/skill-template.md)
- Audit Rules Configuration: [resources/audit-rules.json](./resources/audit-rules.json)
- Frontmatter Validator: [examples/frontmatter_validator.ts](./examples/frontmatter_validator.ts)
- Skill Tree Scaffolder: [examples/skill_scaffolder.ts](./examples/skill_scaffolder.ts)
- Reference Quota Evaluator: [examples/reference_quota_auditor.ts](./examples/reference_quota_auditor.ts)
- Verification Scripts: [scripts/audit_skills.ps1](./scripts/audit_skills.ps1) and [scripts/verify_skill_truth.py](./scripts/verify_skill_truth.py)
