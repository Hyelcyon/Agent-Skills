# Codex Plugins & Cross-Platform Portability

Packaging Codex skills into `.codex-plugin/plugin.json` plugins and reconciling `.agents/skills/` directory conventions across Codex, Claude Code, and Antigravity App.

---

## 1. `.codex-plugin/plugin.json` Distribution

When shipping reusable team skills in Codex:
- Place plugin manifest at `.codex-plugin/plugin.json` (template: [../resources/codex-plugin.template.json](../resources/codex-plugin.template.json)).
- Store each packaged skill in `./skills/<skill-name>/SKILL.md` + optional `./skills/<skill-name>/agents/openai.yaml`.
- Pin MCP dependencies inside `agents/openai.yaml` rather than baking fragile shell auto-install commands inside `SKILL.md`.

---

## 2. Reconciling `assets/` vs `resources/` Across Agents

| Ecosystem | Core Doc | Raw Assets Folder | Invocation Lock Mechanism |
| :--- | :--- | :--- | :--- |
| **OpenAI Codex** | `SKILL.md` | `assets/` (standard) | `agents/openai.yaml` (`policy.allow_implicit_invocation: false`) |
| **Claude Code** | `SKILL.md` | `assets/` or `resources/` | `SKILL.md` frontmatter (`disable-model-invocation: true`) |
| **Antigravity App** | `SKILL.md` | `resources/` (workstation convention) | Explicit refusal / manual confirmation boundaries in `SKILL.md` + `.agents/hooks.json` |

### Senior Authoring Guardrails
- Keep every skill single-purpose, minimally diffed, and grounded in reproducible test/build gates.
- Never copy Claude `allowed-tools: Bash(...)` rules into Codex `SKILL.md` where Codex ignores them.
- Verify real YAML/JSON schemas and Python scripts directly after editing.
