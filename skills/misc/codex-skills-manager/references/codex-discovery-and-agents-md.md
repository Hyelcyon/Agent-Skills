# Codex Skill Discovery & AGENTS.md Cascade

Specification for **OpenAI Codex CLI & App** skill discovery paths, `AGENTS.md` / `AGENTS.override.md` precedence, and invocation mechanics.

---

## 1. Skill Discovery Scope Hierarchy

Codex scans for `<skill-name>/SKILL.md` directories in priority order:

| Scope | Path | Audience |
| :--- | :--- | :--- |
| **Repo Local** | `<cwd>/.agents/skills/` ascending parent dirs to git root | Specific subsystem or workspace |
| **User Shared** | `$HOME/.agents/skills/` | Cross-tool personal agent skills |
| **Codex User** | `~/.codex/skills/` | Codex-specific user skills |
| **Admin / System** | `/etc/codex/skills/` and bundled `~/.codex/skills/.system/` | Enterprise policies & built-ins |

---

## 2. Explicit vs Implicit Invocation

- **Implicit Selection (Default)**: Codex indexes `name` and `description` at startup and automatically reads `SKILL.md` when user intent matches.
- **Explicit Selection**: Users type `$<skill-name>` or pick a skill via `/skills` in Codex CLI/App.
- **Blocking Auto-Selection**: To require explicit `$skill-name` invocation only (recommended for deploys, schema drops, billing actions), do NOT touch `SKILL.md` frontmatter; create `agents/openai.yaml` with `policy.allow_implicit_invocation: false`.

---

## 3. `AGENTS.md` & `AGENTS.override.md` Guidelines

Codex discovers repository instructions independently of skills:
1. Global: `~/.codex/AGENTS.override.md` (if present, overrides `~/.codex/AGENTS.md`).
2. Directory chain: walks from git root down to CWD reading `AGENTS.override.md` first, falling back to `AGENTS.md`.
3. **Budget Invariant**: Codex caps combined loaded `AGENTS.md` bytes at `project_doc_max_bytes` (default `32 KiB`). Keep `AGENTS.md` sharp and move workflow playbooks into on-demand `.agents/skills/`.
