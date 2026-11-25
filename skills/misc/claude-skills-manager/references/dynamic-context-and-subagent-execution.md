# Dynamic Context Injection, Arguments & Subagent Forking

Operational rules for parameterized Claude Code skills (`$ARGUMENTS`), pre-flight shell preprocessing (`` !`cmd` ``), and `context: fork` isolation.

---

## 1. String Substitution Variables

Claude Code substitutes positional and session placeholders when loading a skill:

| Placeholder | Expansion |
| :--- | :--- |
| `$ARGUMENTS` | Full argument string passed after `/skill-name`. If absent from `SKILL.md`, Claude appends `ARGUMENTS: <value>` automatically. |
| `$ARGUMENTS[N]` / `$N` | 0-indexed word argument (`$0`, `$1`, `$2`). |
| `${CLAUDE_SESSION_ID}` | Active Claude Code session identifier for per-session logs or artifacts. |
| `${CLAUDE_SKILL_DIR}` | Directory containing the active `SKILL.md` (safe way to invoke bundled helper scripts cleanly across machines). |

### Safe Argument Handling
- Always define expected inputs cleanly in `argument-hint` (e.g., `"[target-env] [--dry-run]"`).
- Instruct the skill body to validate missing or ambiguous arguments cleanly before running side effects rather than guessing defaults.

---

## 2. Live Dynamic Context via `` !`command` ``

Lines containing `` !`command` `` are executed locally **before** the rendered markdown reaches Claude; stdout replaces the placeholder directly.

### Security & Reliability Rules
1. **Strictly Read-Only Inspection**: Limit dynamic preprocessing to read-only inspection (`git status --short`, `git branch --show-current`, `gh pr diff`).
2. **Never Splice Unsanitized User Strings**: Never embed raw `$ARGUMENTS` into unsafe shell pipelines inside `` !`...` `` blocks.
3. **Never Run Heavy or Blocking Commands**: Preprocessing blocks skill invocation until exit; avoid test suites, builds, or daemon servers in `` !`...` ``.

---

## 3. Isolated Execution (`context: fork`)

Setting `context: fork` spins up an isolated subagent whose initial task prompt is the rendered `SKILL.md` body:

- **When to Fork**: Verbose codebase exploration, multi-file security audits, diff analysis, test failure triage where raw logs would pollute the main conversation context.
- **When NOT to Fork**: Reference knowledge snippets, style rules, or tasks that depend heavily on nuanced discussion history already inside the parent thread.
- **Combining with `agent`**: Pair `context: fork` with `agent: Explore` (read-only research) and narrow `allowed-tools` so exploration skills cannot accidentally mutate repository files.
