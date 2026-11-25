---
name: codex-skills-manager
description: Use when creating, auditing, configuring, or packaging OpenAI Codex CLI or App skills (.agents/skills/, ~/.codex/skills/, agents/openai.yaml, AGENTS.override.md, .codex-plugin/plugin.json), setting allow_implicit_invocation, or debugging $skill discovery.
---

# Codex Skills Manager

Operational runbook for authoring, validating, and organizing **OpenAI Codex CLI & App** skills across `.agents/skills/`, `~/.codex/skills/`, `agents/openai.yaml`, and `.codex-plugin/plugin.json`.

## When to Use
- Authoring or auditing Codex skills under repository `.agents/skills/` or user `~/.codex/skills/`.
- Configuring `agents/openai.yaml` (`interface`, `policy.allow_implicit_invocation: false`, `dependencies.tools` MCP bindings).
- Structuring `AGENTS.md` / `AGENTS.override.md` hierarchies within Codex's `project_doc_max_bytes` budget.
- Validating Codex skill portability or packaging `.codex-plugin/plugin.json` bundles.

## When NOT to Use
- Auditing Antigravity App `skills.json` or `.agents/hooks.json` (use [../antigravity-skills-manager/SKILL.md](../antigravity-skills-manager/SKILL.md)).
- Configuring Claude Code frontmatter (`disable-model-invocation`, `context: fork`) (use [../claude-skills-manager/SKILL.md](../claude-skills-manager/SKILL.md)).

---

## Fatal Mistakes Never to Make

- **Never put Claude frontmatter controls inside Codex `SKILL.md`**: Codex relies on strict open `SKILL.md` fields (`name`, `description`) and ignores/rejects non-standard control flags. Put implicit opt-out inside `agents/openai.yaml` under `policy.allow_implicit_invocation: false`.
- **Never omit `$<skill-name>` in `interface.default_prompt`**: When defining `default_prompt` in `agents/openai.yaml`, include the exact `$skill-name` token so Codex binds UI shortcuts deterministically.
- **Never confuse `assets/` with `resources/` inside generated Codex skills**: Standard Codex skills scan `scripts/`, `references/`, and `assets/`. When generating portable Codex skills, store raw files in `assets/` rather than proprietary folder names.
- **Never edit team `AGENTS.md` for local preferences or exceed the `32 KiB` default cap**: Use `AGENTS.override.md` for temporary/local overrides and split verbose manuals into `references/` so combined docs do not truncate at `project_doc_max_bytes`.
- **Never manually edit Codex internal `.system/` skills or assume unquoted symlinks work safely**: Manage custom skills in `.agents/skills/` or `~/.agents/skills/` and keep tool interfaces strictly backed by schema validation.

---

## 5-Phase Agent Operational Protocol

```text
Phase 1: Scope & Directory Precedence Mapping (.agents/skills vs ~/.codex/skills vs AGENTS.md)
Phase 2: Standard SKILL.md Validation (strict open name & description only)
Phase 3: Codex Sidecar Configuration (agents/openai.yaml interface, policy, MCP dependencies)
Phase 4: Manual + Automated Schema & Cross-Agent Validation
Phase 5: Minimal Diff & Reproducible Verification Report
```

### Phase 1: Scope & Directory Precedence Mapping
Inspect repository `.agents/skills/` upward to git root, plus `$HOME/.agents/skills/` and `~/.codex/skills/`. Check sibling `AGENTS.md` / `AGENTS.override.md` total byte size (`<= 32 KiB` default unless configured higher).

### Phase 2: Standard `SKILL.md` Validation
Confirm YAML frontmatter contains valid `name` (matches directory name, `1..64` lowercase kebab-case) and trigger-rich `description` (`10..1024` chars) free of Claude-specific keys.

### Phase 3: Sidecar Metadata (`agents/openai.yaml`)
Refer to [references/openai-yaml-and-policy-spec.md](./references/openai-yaml-and-policy-spec.md):
- Set `policy.allow_implicit_invocation: false` for risky/manual-only workflows (`$release`, deploys, destructive migrations).
- Configure `interface` (`display_name`, `short_description`, `#RRGGBB` `brand_color`, `default_prompt` mentioning `$skill-name`).
- Declare required MCP dependencies cleanly under `dependencies.tools`.

### Phase 4: Verification Gate
Validate schema conformance against [resources/openai-yaml-schema.json](./resources/openai-yaml-schema.json) and reject mismatched metadata:
```powershell
python -B skills/misc/codex-skills-manager/examples/validate_codex_skill.py skills/misc/codex-skills-manager/SKILL.md
python -B skills/misc/codex-skills-manager/examples/validate_codex_skill.py skills/misc/codex-skills-manager/examples/mcp_bound_skill_openai.yaml
```

### Phase 5: Proof & Delivery
Report verified file paths, policy mode (`allow_implicit_invocation`), byte budget adherence, and real command exit codes.

---

## References, Resources & Examples
- Discovery & `AGENTS.md` Cascade: [references/codex-discovery-and-agents-md.md](./references/codex-discovery-and-agents-md.md)
- `agents/openai.yaml` & Policy Spec: [references/openai-yaml-and-policy-spec.md](./references/openai-yaml-and-policy-spec.md)
- Plugin Packaging & Cross-Agent Portability: [references/codex-cross-platform-and-plugins.md](./references/codex-cross-platform-and-plugins.md)
- `openai.yaml` JSON Schema: [resources/openai-yaml-schema.json](./resources/openai-yaml-schema.json)
- `agents/openai.yaml` Starter Template: [resources/openai.template.yaml](./resources/openai.template.yaml)
- Codex Plugin Manifest Template: [resources/codex-plugin.template.json](./resources/codex-plugin.template.json)
- Explicit Release Skill Example: [examples/explicit_release_skill.md](./examples/explicit_release_skill.md)
- MCP-Bound `openai.yaml` Example: [examples/mcp_bound_skill_openai.yaml](./examples/mcp_bound_skill_openai.yaml)
- Python Codex Skill & `openai.yaml` Validator: [examples/validate_codex_skill.py](./examples/validate_codex_skill.py)
