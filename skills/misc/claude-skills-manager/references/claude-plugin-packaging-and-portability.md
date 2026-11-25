# Claude Plugin Packaging & Cross-Agent Portability

Guidelines for distributing skills in Claude Code plugins and keeping shared `.agents/skills/` repositories safe across Claude, Codex, and Antigravity.

---

## 1. `.claude-plugin/plugin.json` Structure

When bundling skills inside a plugin repository:
- Place the manifest at `.claude-plugin/plugin.json`.
- Put skill folders inside `skills/<skill-name>/SKILL.md` (at the plugin root or paths declared in `"skills"`).
- Claude Code namespaces plugin skills as `/<plugin-name>:<skill-name>` to avoid collisions with user/project skills.
- Keep supporting scripts inside `<skill-dir>/scripts/` and invoke them via `${CLAUDE_SKILL_DIR}/scripts/...`.

See starter template: [../resources/claude-plugin.template.json](../resources/claude-plugin.template.json).

---

## 2. Cross-Agent Portability Matrix (`.agents/skills/`)

Modern repositories often expose `.agents/skills/` to **Claude Code**, **OpenAI Codex**, and **Google Antigravity App**. Keep tool names and metadata honest:

| Concept | Claude Code | Antigravity Desktop App | OpenAI Codex |
| :--- | :--- | :--- | :--- |
| **Core Standard** | `SKILL.md` (`agentskills.io`) | `SKILL.md` (`agentskills.io`) | `SKILL.md` (`agentskills.io`) |
| **Model Auto-Trigger Opt-Out** | Frontmatter `disable-model-invocation: true` | Explicit instruction boundary in `SKILL.md` | `agents/openai.yaml` (`allow_implicit_invocation: false`) |
| **Shell Tool Name** | `Bash` | `run_command` | Shell tool |
| **File Edit Tool Name** | `Edit` / `Write` | `edit_file` / `write_file` | Apply patch / write |
| **Hooks Configuration** | `.claude/settings.json` / frontmatter `hooks` | `.agents/hooks.json` | Codex sandbox / approvals |

**Rule**: Never paste Claude `Bash(...)` permissions or Antigravity `PreToolUse` JSON contracts into cross-agent instructions without labeling the target harness explicitly.

---

## 3. Senior Skill Authoring Discipline

- **Root Cause First**: Include explicit guidance telling the skill to trace failing callers and reproduce issues before writing edits.
- **Minimal Diff**: Forbid unrelated refactoring or comment spam inside skill-generated edits.
- **Empirical Verification**: Require a concrete verification command (compiler, test runner, schema check) before claiming completion.
