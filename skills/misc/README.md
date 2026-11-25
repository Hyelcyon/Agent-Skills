# Miscellaneous Agent Skills

Utility and governance skills for managing cross-platform agent skill ecosystems and enforcing Senior Engineering craftsmanship.

## Available Skills

| Skill | Description | Primary Use Case |
| :--- | :--- | :--- |
| **[antigravity-skills-manager](./antigravity-skills-manager/SKILL.md)** | Audits, verifies, registers, and diagnoses Antigravity Desktop App skills and `skills.json` / `.agents/skills.json` manifests. | Fixing unindexed skills, schema validation, manual side-by-side audits. |
| **[claude-skills-manager](./claude-skills-manager/SKILL.md)** | Designs, validates, and packages Claude Code skills (`disable-model-invocation`, `user-invocable`, `context: fork`, `.claude-plugin/plugin.json`). | Safely configuring slash-only skills, forked reviewers, and Claude plugins. |
| **[codex-skills-manager](./codex-skills-manager/SKILL.md)** | Manages OpenAI Codex CLI/App skills (`.agents/skills/`, `~/.codex/skills/`, `agents/openai.yaml`, `AGENTS.override.md`). | Binding MCP dependencies, implicit policy flags, and `$skill` packaging. |
| **[senior](./senior/SKILL.md)** | Enforces lazy senior developer craftsmanship: minimal surgical diffs, root-cause tracing, YAGNI, and empirical proof. | Preventing speculative abstractions, comment noise, and false done claims. |
| **[maintenance](./maintenance/SKILL.md)** | Governs ongoing codebase maintenance: safe dependency upgrades, characterization refactoring, and dead-code pruning. | Dependency bumps, tech-debt triage, and post-incident regression guards. |
