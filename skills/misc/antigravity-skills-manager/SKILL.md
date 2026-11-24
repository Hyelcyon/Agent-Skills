---
name: antigravity-skills-manager
description: Use when auditing, verifying, organizing, registering, or diagnosing Antigravity skills and skills.json paths across workspace and global environments, fixing unindexed skills, or validating Triad quotas.
---

# Antigravity Skills Manager

An operational manager and runbook for organizing, auditing, and maintaining custom skills and configurations within Google Antigravity environments.

## When to Use
- Auditing installed skills across workspace (`.agents/skills/`) and global (`~/.gemini/config/skills/`) paths.
- Diagnosing why a skill is not discovered or triggered by Antigravity.
- Registering nested or categorized skill directories into `skills.json`.
- Validating YAML frontmatter (`name`, `description`) and Markdown structure across skills.
- Auditing skill subdirectories (`references/`, `scripts/`, `resources/`, `examples/`) for token efficiency.
- Safely archiving, cleaning up, or reorganizing custom skills.

## When NOT to Use
- Designing or authoring new custom skill specifications from scratch (see [antigravity-skills-developer.md](./references/antigravity-skills-developer.md)).
- Enforcing persistent coding standards or safety constraints (use `rules/` or `AGENTS.md`).
- Executing the functional task of another specialized skill.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Discovery Root & Path Mapping (skills.json verification)
Phase 2: Anatomy & Quota Inspection (references, examples, resources)
Phase 3: Frontmatter & Protocol Health Audit (name, description, 5-phase)
Phase 4: Deterministic Audit Execution (audit_skills.ps1, zero comments)
Phase 5: Transparent Proof & Index Synchronization
```

### Phase 1: Discovery Root & Path Mapping
Inspect `skills.json` and active workspaces. Verify that all nested skill category directories are registered under `entries`.

### Phase 2: Anatomy & Quota Inspection
Verify the Triad Quotas for each skill: minimum 3 references (7 for major frontend/runtime frameworks), minimum 3 production examples, and minimum 3 starter resources.

### Phase 3: Frontmatter & Protocol Health Audit
Ensure every `SKILL.md` starts with valid YAML frontmatter, `name` matches directory, `description` starts strictly with `Use when...`, and the 5-Phase Protocol is defined.

### Phase 4: Deterministic Audit Execution
Run the automated verification suite:
```bash
powershell -ExecutionPolicy Bypass -File skills/misc/antigravity-skills-manager/scripts/audit_skills.ps1
```

### Phase 5: Transparent Proof & Index Synchronization
Report audit results with clear evidence. Synchronize new directories to `skills.json` if missing.

---

## Prohibited Anti-Patterns

- ❌ Nesting skills deeper than 1 level without registering the parent in `skills.json`.
- ❌ Summarizing workflows inside frontmatter `description` (violates Discovery Optimization).
- ❌ Bloating `SKILL.md` past 180 lines instead of using `references/`.
- ❌ Leaving empty subdirectories or stub files with less than 200 bytes.
- ❌ Including inline comments in examples and resource configurations.

---

## References & Documentation
- Antigravity Skills Developer Deep Dive: [references/antigravity-skills-developer.md](./references/antigravity-skills-developer.md)
- Skills Progressive Disclosure Model: [references/skills-progressive-disclosure-model.md](./references/skills-progressive-disclosure-model.md)
- Skills Authoring & Testing Framework: [references/skills-authoring-and-testing-framework.md](./references/skills-authoring-and-testing-framework.md)

## Resources & Examples
- Skills JSON Schema: [resources/skills-schema.json](./resources/skills-schema.json)
- Standard SKILL.md Template: [resources/skill-template.md](./resources/skill-template.md)
- Audit Rules Configuration: [resources/audit-rules.json](./resources/audit-rules.json)
- Skill Tree Scaffolder: [examples/skill_scaffolder.ts](./examples/skill_scaffolder.ts)
- Frontmatter Validator: [examples/frontmatter_validator.ts](./examples/frontmatter_validator.ts)
- Reference Quota Auditor: [examples/reference_quota_auditor.ts](./examples/reference_quota_auditor.ts)
