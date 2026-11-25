---
name: claude-skills-manager
description: Use when creating, auditing, configuring, or packaging Claude Code skills (.claude/skills/, ~/.claude/skills/, .claude-plugin/plugin.json), setting disable-model-invocation, user-invocable, context fork, allowed-tools, or troubleshooting Claude skill triggering.
---

# Claude Skills Manager

Operational guide for authoring, auditing, and packaging **Anthropic Claude Code** skills across personal (`~/.claude/skills/`), project (`.claude/skills/`), and plugin (`.claude-plugin/plugin.json`) scopes.

## When to Use
- Creating or auditing Claude Code skills (`SKILL.md` extensions, slash commands, forked subagent execution).
- Configuring `disable-model-invocation`, `user-invocable`, `allowed-tools`, `context: fork`, `agent`, `argument-hint`, or dynamic `` !`command` `` context.
- Packaging skills inside `.claude-plugin/plugin.json` or sharing `.agents/skills/` safely between Claude Code, Codex, and Antigravity.

## When NOT to Use
- Auditing Google Antigravity App `skills.json` or `.agents/hooks.json` (use [../antigravity-skills-manager/SKILL.md](../antigravity-skills-manager/SKILL.md)).
- Configuring OpenAI Codex `agents/openai.yaml` or `AGENTS.override.md` (use [../codex-skills-manager/SKILL.md](../codex-skills-manager/SKILL.md)).

---

## Fatal Mistakes Never to Make

- **Never combine `disable-model-invocation: true` and `user-invocable: false` together**: Setting both renders the skill unreachable—neither Claude nor the user's `/` slash menu can invoke it.
- **Never auto-enable model invocation on destructive workflows**: Deployments, database drops, force pushes, and external writes must set `disable-model-invocation: true` so only explicit `/skill-name` triggers execution.
- **Never run unsafe writes or unquoted user inputs inside `` !`command` ``**: Shell preprocessing runs *before* Claude reads the prompt; keep commands read-only (`git diff`, `gh pr view`) and never inject untrusted `$ARGUMENTS` straight into shell pipelines without quoting/validation.
- **Never set `context: fork` on style guidelines or skills needing chat history**: A forked subagent starts with zero prior conversation turns; plain inline guidelines (`conventions`) must stay un-forked.
- **Never leak Claude-only frontmatter into strict cross-platform specs blindly**: Standard `agentskills.io` parsers in Antigravity or Codex ignore or reject Claude keys (`context`, `disable-model-invocation`, `hooks`); document cross-agent compatibility explicitly or validate with [examples/validate_claude_skill.py](./examples/validate_claude_skill.py).
- **Never summarize implementation steps inside `description`**: State trigger keywords and exclusion boundaries concisely (startup skill descriptions share a ~2% context budget with a ~16KB fallback).

---

## 5-Phase Agent Operational Protocol

```text
Phase 1: Scope & Discovery Mapping (~/.claude/skills vs .claude/skills vs .agents/skills)
Phase 2: Frontmatter & Invocation Control Design (disable-model-invocation, user-invocable, context)
Phase 3: Argument, Dynamic Context & Permission Hardening ($ARGUMENTS, allowed-tools)
Phase 4: Manual + Automated Schema & Conflict Verification
Phase 5: Minimal Diff & Reproducible Verification Report
```

### Phase 1: Scope & Discovery Mapping
Determine visibility and precedence (`Enterprise > ~/.claude/skills/ > .claude/skills/ > Plugin`). Note that Claude Code also scans project `.agents/skills/` and legacy `.claude/commands/`.

### Phase 2: Frontmatter & Invocation Control Design
Choose one explicit invocation mode from [references/claude-frontmatter-and-discovery.md](./references/claude-frontmatter-and-discovery.md):
- **Standard**: defaults (`user-invocable: true`, `disable-model-invocation: false`).
- **Explicit slash-only (side effects)**: `disable-model-invocation: true`.
- **Background knowledge only**: `user-invocable: false` (requires model auto-triggering).
- **Isolated worker**: `context: fork` + optional `agent: Explore|Plan|general-purpose`.

### Phase 3: Argument, Dynamic Context & Tool Shielding
Review [references/dynamic-context-and-subagent-execution.md](./references/dynamic-context-and-subagent-execution.md). Bind `$ARGUMENTS` or positional `$0`/`$1`, scope `allowed-tools` tightly (e.g., `Read, Grep, Bash(git diff *)`), and verify read-only `` !`cmd` `` safety.

### Phase 4: Verification Gate
Validate schema, contradictory flags, link integrity, and frontmatter bounds against [resources/claude-skill-frontmatter-schema.json](./resources/claude-skill-frontmatter-schema.json):
```powershell
python -B skills/misc/claude-skills-manager/examples/validate_claude_skill.py skills/misc/claude-skills-manager/resources/claude-skill-template.md
```

### Phase 5: Proof & Delivery
Report checked file paths, validated invocation policy, budget impact, and exact validator exit codes.

---

## References, Resources & Examples
- Frontmatter & Discovery Matrix: [references/claude-frontmatter-and-discovery.md](./references/claude-frontmatter-and-discovery.md)
- Dynamic Context, Arguments & `context: fork`: [references/dynamic-context-and-subagent-execution.md](./references/dynamic-context-and-subagent-execution.md)
- Plugin Packaging & Cross-Agent Portability: [references/claude-plugin-packaging-and-portability.md](./references/claude-plugin-packaging-and-portability.md)
- Claude Frontmatter JSON Schema: [resources/claude-skill-frontmatter-schema.json](./resources/claude-skill-frontmatter-schema.json)
- Claude Skill Template: [resources/claude-skill-template.md](./resources/claude-skill-template.md)
- Claude Plugin Manifest Template: [resources/claude-plugin.template.json](./resources/claude-plugin.template.json)
- Read-Only Forked PR Review Example: [examples/readonly_pr_review_skill.md](./examples/readonly_pr_review_skill.md)
- Explicit Side-Effect Deploy Example: [examples/guarded_deploy_skill.md](./examples/guarded_deploy_skill.md)
- Python Claude Frontmatter Validator: [examples/validate_claude_skill.py](./examples/validate_claude_skill.py)
