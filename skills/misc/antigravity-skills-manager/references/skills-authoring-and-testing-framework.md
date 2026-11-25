# Antigravity Skills Authoring, Manual Review & Testing Framework

Validation rules, manual side-by-side verification standards, and automated gates for Antigravity Desktop App skills.

---

## 1. Automated Gate vs Manual Verification (Why Scripts Alone Fail)

Automated checks catch syntax errors, broken links, and missing files, **but they cannot prove technical truth**. Every substantive skill update requires both:

1. **Automated Structural & Syntax Gate**:
   - `skills.json` / `.agents/skills.json` parity and path resolution.
   - Frontmatter YAML parsing (`name` matches directory name, `1..64` chars; `description` `10..1024` chars).
   - Zero broken relative links, zero unclosed code fences, Python `ast.parse` and JSON validity.
2. **Manual Side-by-Side Technical Verification**:
   - **API & Version Check**: Compare signatures in `SKILL.md`, `references/`, and `examples/` directly against current official documentation (e.g., Java 25 JEP 505 `StructuredTaskScope.open()`, Angular 19 `linkedSignal`/`resource`, Python 3.12+ `datetime.now(timezone.utc)`).
   - **Security Check**: Audit code examples manually for SSRF IPv4-mapped IPv6 bypasses, constant-time token comparison (`hmac.compare_digest`), hardcoded secret literals, XSS/injection flaws, or missing `__Host-` cookie checks.
   - **OS & Shell Portability Check**: Ensure verification commands work safely on Windows PowerShell as well as Linux/macOS without blocking forever on dev servers (`vite preview`, `prism mock`).

---

## 2. Comment Discipline: Zero AI-Slop (Allow Invariant "Why" Comments)

Blanket rules banning all `#` or `//` break executable shebangs (`#!/usr/bin/env bash`), shell portability markers (`# bash`), and non-obvious invariant explanations. Enforce precision instead:

- **Forbidden (Echo / AI-Slop Comments)**: Comments restating syntax (`// increment i`, `# load config`, `/* return true */`) or dead commented-out code.
- **Preserved / Encouraged (Engineering Comments)**:
  - Executable shebangs (`#!/usr/bin/env python3`, `#!/usr/bin/env bash`) and `# bash` / `# linux` markers used by portability auditors.
  - Brief comments explaining **non-obvious invariants, concurrency hazards, OS quirks, or spec workarounds** (e.g., why IPv4-mapped IPv6 is unboxed before `is_global`, or why `flock` lockfiles must not be `rm -f`'d on exit).

---

## 3. Quality Gates Configuration

Refer to [../resources/audit-rules.json](../resources/audit-rules.json):
- `SKILL.md` stays concise (`< 180` lines in workstation catalog; never monolithically bloated).
- YAML frontmatter validated against [../resources/skill-frontmatter-schema.json](../resources/skill-frontmatter-schema.json).
- Discovery manifests validated against [../resources/skills-schema.json](../resources/skills-schema.json).
- No stub artifacts (`< 40` bytes, matching `minArtifactBytes` in `audit-rules.json`) created merely to hit count metrics.

---

## 4. Verification Execution

Run the PowerShell structural audit across both manifests plus the Python truth verifier:

```powershell
powershell -ExecutionPolicy Bypass -File skills/misc/antigravity-skills-manager/scripts/audit_skills.ps1 -ConfigPath skills.json
powershell -ExecutionPolicy Bypass -File skills/misc/antigravity-skills-manager/scripts/audit_skills.ps1 -ConfigPath .agents/skills.json
python skills/misc/antigravity-skills-manager/scripts/verify_skill_truth.py
```

Treat a zero exit code from scripts as the **floor, not the ceiling**—always pair script runs with manual compiler/test execution (`tsc --noEmit`, `ruff check`, `python -m unittest`) after final edits.
