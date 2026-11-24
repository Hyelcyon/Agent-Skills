# Antigravity Skills Authoring and Automated Testing Framework

Verification framework, schema validation rules, and automated audit pipelines for maintaining enterprise-grade Antigravity skills.

## 1. Skill Lifecycle and Authoring Pipeline

Authoring a production skill follows a 4-step engineering pipeline:
1. **Scaffold Directory Structure**: Create skill root with `references/`, `examples/`, `resources/` subdirectories.
2. **Author Discovery Metadata & Protocol**: Create `SKILL.md` (<180 lines) with valid YAML frontmatter and 5-phase operational workflow.
3. **Populate Triad Artifacts**:
   - Minimum 3 working code examples in `examples/`.
   - Minimum 3 starter templates or configs in `resources/`.
   - Minimum 3 modular reference documents in `references/` (minimum 7 for major frameworks).
4. **Automated Audit**: Execute `audit_skills.ps1` to verify frontmatter, discovery status, quota compliance, and zero inline comments.

---

## 2. Automated Schema and Quality Gates

The skills audit suite executes programmatic checks across all skills in the workspace:

```json
{
  "rules": {
    "maxSkillLines": 180,
    "requireFrontmatter": true,
    "minExamplesCount": 3,
    "minResourcesCount": 3,
    "minReferencesCount": 3,
    "majorFrameworkMinReferences": 7,
    "forbidInlineCodeComments": true
  }
}
```

### The Zero-Inline-Comment Law

Code snippets in examples, resources, and references must contain zero inline comments (`//`, `/* */`, `#`, `--`). 

Why inline comments are forbidden:
- Low-value commentary causes token bloat.
- AI models frequently copy-paste obsolete comments directly into generated user code.
- Explanations must reside in markdown prose surrounding code blocks.

---

## 3. Automated Validation Script Execution

Run the workspace audit script to verify repository compliance:

```powershell
powershell -ExecutionPolicy Bypass -File skills/misc/antigravity-skills-manager/scripts/audit_skills.ps1
```

The script reports:
- **Discovery**: Whether the skill is discoverable via root parentage or `skills.json` entry.
- **Frontmatter**: Validates presence of opening `---`, `name:`, and `description:`.
- **Examples / Resources / References**: Exact file counts per subdirectory.
- **Triad**: Evaluates `PASS` when Examples $\ge 3$ and Resources $\ge 3$.
- **Empty Dirs**: Flags any lingering empty directories.
