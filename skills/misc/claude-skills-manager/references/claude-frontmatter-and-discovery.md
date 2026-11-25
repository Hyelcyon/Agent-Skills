# Claude Code Frontmatter & Discovery Reference

Detailed specification for **Claude Code** skill discovery locations, frontmatter controls, invocation modes, and startup budget rules.

---

## 1. Discovery Scopes & Precedence

Claude Code scans multiple roots and resolves name collisions by highest precedence:

| Precedence | Location | Visibility |
| :--- | :--- | :--- |
| **1 (Highest)** | Managed / Enterprise policy paths | Organization-wide |
| **2** | `~/.claude/skills/<skill-name>/SKILL.md` | User personal (all projects) |
| **3** | `<repo>/.claude/skills/<skill-name>/SKILL.md` | Project repository |
| **4** | `<repo>/.agents/skills/<skill-name>/SKILL.md` | Cross-agent project directory |
| **5** | Installed plugins (`<plugin>/skills/<name>/SKILL.md`) | Namespaced `/plugin:skill-name` |

Legacy `.claude/commands/<name>.md` files remain supported, though skills directories (`SKILL.md` + supporting files) are preferred and take precedence on collision.

---

## 2. Frontmatter Extensions Matrix

Beyond `agentskills.io` core fields (`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`), Claude Code supports these runtime fields:

| Field | Type | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `argument-hint` | `string` | None | Autocomplete placeholder in `/` menu (e.g., `"[issue-number]"`). |
| `disable-model-invocation` | `boolean` | `false` | When `true`, blocks automatic model invocation; user must type `/skill`. |
| `user-invocable` | `boolean` | `true` | When `false`, hides from `/` menu; model loads implicitly when relevant. |
| `allowed-tools` | `string` | Inherit | Tools pre-approved during skill execution without per-call prompts (`Read, Grep, Bash(git status)`). |
| `model` | `string` | Inherit | Model override while the skill executes. |
| `effort` | `string` | Inherit | Reasoning effort override (`low`, `medium`, `high`, `max` depending on model). |
| `context` | `string` | Inline | Set `fork` to execute the skill inside an isolated subagent context. |
| `agent` | `string` | `general-purpose` | Subagent profile when `context: fork` is active (`Explore`, `Plan`, custom agent). |
| `paths` | `string[]` | Global | Glob filters limiting activation to matching file paths. |
| `hooks` | `object` | None | Skill-scoped hook lifecycle handlers (`PreToolUse`, `PostToolUse`, `Stop`). |

---

## 3. Invocation Truth Table

| `disable-model-invocation` | `user-invocable` | User `/` Menu | Auto Model Trigger | Valid Use Case |
| :--- | :--- | :--- | :--- | :--- |
| `false` | `true` | Yes | Yes | General development workflows |
| `true` | `true` | Yes | **No** | Deployments, commits, DB mutations, external posts |
| `false` | `false` | **No** | Yes | Background domain conventions & guardrails |
| `true` | `false` | **No** | **No** | **BROKEN CONFIG — UNREACHABLE DEAD SKILL** |

---

## 4. Startup Character Budget & Trigger Hygiene

- Claude loads only `name` + `description` at startup within a proportional context budget (~2% of context window, with a ~16,000-char fallback floor).
- Keep `SKILL.md` under 500 lines and offload heavy specs to `references/`.
- Avoid multi-step procedural summaries inside `description`; describe *when* and *what problem domain* triggers the skill so Claude opens `SKILL.md` instead of guessing steps from memory.
